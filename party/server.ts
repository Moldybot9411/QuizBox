import type * as Party from 'partykit/server';
import {
	State,
	MessageType,
	GameState,
	createDefaultState,
	ServerMessage,
	ClientMessageSchema,
	TriviaData,
	ActionMessage,
	Player,
} from '../src/lib/shared/schema';
import { corsHeaders } from './CORS';
import { nanoid } from 'nanoid';
import { GameStateHandler } from './states/GameStateHandler';
import { LobbyState } from './states/LobbyState';
import { PlayingState } from './states/PlayingState';
import { PostgameState } from './states/PostgameState';
import randomName from '@scaleway/random-name';
import { EvaluationState } from './states/EvaluationState';
import { type ItemType } from '../src/lib/shared/items';
import { ItemPullState } from './states/ItemPullState';

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {
		this.gameState = createDefaultState();
		this.adminSecret = '';
		this.transitionTo(this.gameState.state);
		this.playerAnswers = new Map();
		this.playerItems = new Map();
		this.activeItems = new Map();
	}

	gameState: GameState;
	adminSecret: string;
	triviaData: TriviaData | undefined;
	stateHandler!: GameStateHandler;
	playerAnswers: Map<string, { index: number; answer: string; timeDelta: number }>; // Which player answered what
	playerItems: Map<string, { itemType: ItemType }[]>; // Which player holds which items
	activeItems: Map<string, { equipped: ItemType; hitBy: { item: ItemType; origin: Player }[] }>; // Players item state for the current round

	async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext): Promise<void> {
		const created = await this.room.storage.get<boolean>('created');

		if (!created) return;

		await this.room.storage.deleteAlarm();

		this.gameState.playerCount = Array.from(this.room.getConnections()).length;

		this.gameState.players.push({
			id: connection.id,
			name: randomName('', ' ')
				.split(' ')
				.map((n) => n.charAt(0).toUpperCase() + n.slice(1))
				.join(' '),
		});

		// Give the first player to join admin
		if (this.gameState.playerCount === 1) {
			this.gameState.adminId = connection.id;

			this.adminSecret = nanoid();

			const envelope: ServerMessage = {
				type: MessageType.ADMINSECRET,
				secret: this.adminSecret,
			};

			connection.send(JSON.stringify(envelope));
		}

		if (this.stateHandler.onConnect) {
			this.stateHandler.onConnect(connection);
		}

		const sync: ServerMessage = {
			type: MessageType.SYNC,
			gameState: this.gameState,
		};

		const playerUpdate: ServerMessage = {
			type: MessageType.PLAYERUPDATE,
			playerCount: this.gameState.playerCount,
			players: this.gameState.players,
		};

		connection.send(JSON.stringify(sync));
		this.room.broadcast(JSON.stringify(playerUpdate), [connection.id]);
		this.syncInventory(connection);
	}

	async onClose(connection: Party.Connection): Promise<void> {
		const alarm = await this.room.storage.getAlarm();

		// Set alarm to delete room state 5 minutes after last player left
		if (!alarm) {
			await this.room.storage.setAlarm(Date.now() + 5 * 60 * 1000);
		}

		this.gameState.playerCount = Array.from(this.room.getConnections()).length;
		this.gameState.players = this.gameState.players.filter((p) => p.id !== connection.id);

		if (this.gameState.playerCount > 0 && connection.id === this.gameState.adminId) {
			const connections = Array.from(this.room.getConnections()).filter(
				(el) => el.id !== connection.id
			);

			if (connections.length > 0) {
				const nextAdmin = connections[0];
				this.gameState.adminId = nextAdmin.id;

				this.adminSecret = nanoid();

				const envelope: ServerMessage = {
					type: MessageType.ADMINSECRET,
					secret: this.adminSecret,
				};

				nextAdmin.send(JSON.stringify(envelope));
			} else {
				this.gameState.adminId = '';
			}
		}

		if (this.stateHandler.onClose) {
			this.stateHandler.onClose(connection);
		}

		const playerUpdate: ServerMessage = {
			type: MessageType.PLAYERUPDATE,
			playerCount: this.gameState.playerCount,
			players: this.gameState.players,
		};

		const newAdmin: ServerMessage = {
			type: MessageType.ADMINCHANGE,
			adminId: this.gameState.adminId,
		};

		this.room.broadcast(JSON.stringify(playerUpdate));
		this.room.broadcast(JSON.stringify(newAdmin));
	}

	async onMessage(
		message: string | ArrayBuffer | ArrayBufferView,
		sender: Party.Connection
	): Promise<void> {
		const created = await this.room.storage.get<boolean>('created');

		if (!created || typeof message !== 'string') return;

		try {
			const rawData = JSON.parse(message);
			const parsedMessage = ClientMessageSchema.parse(rawData);

			// Make returning to lobby possible from any state
			if (parsedMessage.action === ActionMessage.BACK_TO_LOBBY) {
				if (this.isSenderAdmin(sender, parsedMessage.adminSecret)) {
					this.softReset();

					this.broadcastSync();
				}
			}

			this.stateHandler.onMessage(parsedMessage, sender);
		} catch (e) {
			console.error('Zod error or invalid messsage:', e);
		}
	}

	async onRequest(req: Party.Request): Promise<Response> {
		let exists = await this.room.storage.get<boolean>('created');
		const tokenHeader = req.headers.get('token');

		if (!tokenHeader || tokenHeader !== this.room.env['SECRET_TOKEN']) {
			return new Response('Unauthorized', { status: 401, headers: corsHeaders });
		}

		if (req.method === 'GET') {
			if (exists) {
				return new Response('Room exists', { status: 200, headers: corsHeaders });
			}

			return new Response('Room not found', { status: 404, headers: corsHeaders });
		}

		if (req.method === 'POST') {
			if (exists) {
				return new Response('Conflict: Room already exists', { status: 409, headers: corsHeaders });
			}

			this.room.storage.put('created', true);
			this.gameState = createDefaultState();

			return new Response('Room created', { status: 201 });
		}

		return new Response('Bad Request', { status: 400, headers: corsHeaders });
	}

	async onAlarm(): Promise<void> {
		const playerCount = Array.from(this.room.getConnections()).length;

		if (playerCount > 0) return;

		await this.room.storage.delete('created');
		this.gameState = createDefaultState();
		this.adminSecret = '';
		this.triviaData = undefined;
	}

	/**
	 * Broadcast the entire current game state to the room
	 */
	public broadcastSync() {
		const envelope: ServerMessage = {
			type: MessageType.SYNC,
			gameState: this.gameState,
		};

		this.room.broadcast(JSON.stringify(envelope));
	}

	/**
	 * Reset game state but leaving the current Admin intact
	 */
	public softReset() {
		let resetState = createDefaultState();

		this.transitionTo(resetState.state);

		resetState.adminId = this.gameState.adminId;
		resetState.players = this.gameState.players;
		resetState.playerCount = this.gameState.playerCount;

		this.triviaData = undefined;
		this.playerAnswers = new Map();
		this.playerItems = new Map();
		this.activeItems = new Map();

		this.gameState = resetState;
	}

	public isSenderAdmin(connection: Party.Connection, secret: string): boolean {
		if (connection.id !== this.gameState.adminId) return false;
		if (this.adminSecret !== secret) return false;

		return true;
	}

	public transitionTo(newState: State) {
		if (this.stateHandler?.onLeave) {
			this.stateHandler.onLeave();
		}

		this.gameState.state = newState;

		switch (newState) {
			case State.LOBBY:
				this.stateHandler = new LobbyState(this);
				break;
			case State.ITEM_PULL:
				this.stateHandler = new ItemPullState(this);
				break;
			case State.PLAYING:
				this.stateHandler = new PlayingState(this);
				break;
			case State.EVALUATION:
				this.stateHandler = new EvaluationState(this);
				break;
			case State.POSTGAME:
				this.stateHandler = new PostgameState(this);
				break;
		}

		if (this.stateHandler?.onEnter) {
			this.stateHandler.onEnter();
		}

		this.broadcastSync();
	}

	public getCurrentQuestion(): string {
		return this.triviaData?.results[this.gameState.currentRound].question || '';
	}

	public getCurrentAnswers(): string[] {
		return this.triviaData?.results[this.gameState.currentRound]
			? [
					...this.triviaData.results[this.gameState.currentRound].incorrect_answers,
					this.triviaData.results[this.gameState.currentRound].correct_answer,
				]
			: [];
	}

	public getCurrentTriviaData() {
		return this.triviaData?.results[this.gameState.currentRound];
	}

	public syncInventory(conn: Party.Connection) {
		const inventorySync: ServerMessage = {
			type: MessageType.INVENTORY_SYNC,
			inventory: this.playerItems.get(conn.id) ?? [],
		};

		conn.send(JSON.stringify(inventorySync));
	}
}
