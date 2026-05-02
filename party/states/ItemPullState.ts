import { Connection } from 'partykit/server';
import {
	ActionMessage,
	ClientMessage,
	MessageType,
	Player,
	ServerMessage,
	State,
} from '../../src/lib/shared/schema';
import Server from '../server';
import { GameStateHandler } from './GameStateHandler';
import { ItemBalancing } from '../../src/lib/shared/itemBalancing';
import { ItemType } from '../../src/lib/shared/items';
import { MAX_ITEMS } from '../../src/lib/shared/gameSettings';

export class ItemPullState implements GameStateHandler {
	constructor(private server: Server) {
		this.orderedScoreBoard = [];
		this.givenItems = new Map();
		this.readyPlayers = [];

		for (const player of server.gameState.players) {
			const playerData: (typeof server.gameState.scoreBoard)[''] | undefined =
				server.gameState.scoreBoard[player.id];

			const playerItemCount = server.playerItems.get(player.id)?.length ?? 0;

			this.orderedScoreBoard.push({
				id: player.id,
				name: player.name,
				score: playerData?.totalScore ?? 0,
				numCorrectAnswers: playerData?.numCorrectAnswers ?? 0,
				numItems: playerItemCount,
			});
		}

		this.orderedScoreBoard = this.orderedScoreBoard.sort(
			(a, b) =>
				b.score - a.score ||
				b.numCorrectAnswers - a.numCorrectAnswers ||
				a.name.localeCompare(b.name)
		);

		this.isFirstRound = this.orderedScoreBoard[0]?.score ? false : true;
	}

	orderedScoreBoard: {
		id: string;
		name: string;
		score: number;
		numCorrectAnswers: number;
		numItems: number;
	}[];
	isFirstRound: boolean;
	givenItems: Map<string, ItemType>;
	readyPlayers: Player[];

	onEnter(): void {
		const allConnections = Array.from(this.server.room.getConnections());

		for (const connection of allConnections) {
			this.giveItem(connection);
			this.server.syncInventory(connection);
		}
	}

	onConnect(connection: Connection): void {
		this.giveItem(connection);

		const readyPlayersEnvelope: ServerMessage = {
			type: MessageType.PULL_STATE_READY,
			readyPlayers: this.readyPlayers,
		};

		connection.send(JSON.stringify(readyPlayersEnvelope));
	}

	onClose(connection: Connection): void {
		this.readyPlayers = this.readyPlayers.filter((el) => el.id !== connection.id);

		const envelope: ServerMessage = {
			type: MessageType.PULL_STATE_READY,
			readyPlayers: this.readyPlayers,
		};

		this.server.room.broadcast(JSON.stringify(envelope));
	}

	onLeave(): void {
		// Reset the client's information about the pull state to make it work correctly the next time
		this.readyPlayers = [];

		const itemEnvelope: ServerMessage = {
			type: MessageType.PULL_STATE_ITEM,
			yourItem: undefined,
		};

		this.broadcastReadyPlayers();
		this.server.room.broadcast(JSON.stringify(itemEnvelope));
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.PULL_STATE_PLAYER_READY:
				if (!this.readyPlayers.find((el) => el.id === sender.id)) {
					this.readyPlayers.push({
						id: sender.id,
						name:
							this.server.gameState.players.find((el) => el.id === sender.id)?.name ?? 'Unknown',
					});
				}

				this.broadcastReadyPlayers();

				break;

			case ActionMessage.PULL_STATE_CONTINUE:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) break;
				if (this.readyPlayers.length !== this.server.gameState.playerCount) break;

				this.server.transitionTo(State.PLAYING);
				break;
		}
	}

	giveItem(conn: Connection) {
		// Send item if player already got an item.
		const existingItem = this.givenItems.get(conn.id);
		if (existingItem !== undefined) {
			const existingItemEnvelope: ServerMessage = {
				type: MessageType.PULL_STATE_ITEM,
				yourItem: existingItem,
			};

			conn.send(JSON.stringify(existingItemEnvelope));
			return;
		}

		// Check if player already has his maximum amount of items
		const fullPlayerItems = this.server.playerItems.get(conn.id) ?? [];
		if (fullPlayerItems.length >= MAX_ITEMS) {
			// Enter Player as 'ready'
			if (!this.readyPlayers.find((el) => el.id === conn.id)) {
				this.readyPlayers.push({
					id: conn.id,
					name: this.server.gameState.players.find((el) => el.id === conn.id)?.name ?? 'Unknown',
				});

				this.broadcastReadyPlayers();
			}

			const emptyItemEnvelope: ServerMessage = {
				type: MessageType.PULL_STATE_ITEM,
				yourItem: undefined,
			};

			conn.send(JSON.stringify(emptyItemEnvelope));
			return;
		}

		// Give Player new Item
		const playerRank = this.orderedScoreBoard.findIndex((el) => el.id === conn.id);

		// 0.0 -> 1st Place  |  1.0 -> Last Place
		let relativePosition = playerRank === -1 ? 1 : 0.5;
		if (playerRank >= 0 && this.orderedScoreBoard.length > 1) {
			relativePosition = playerRank / (this.orderedScoreBoard.length - 1);
		}

		let pool;
		if (relativePosition <= ItemBalancing.thresholds.top) {
			pool = ItemBalancing.lootTables.top;
		} else if (relativePosition >= ItemBalancing.thresholds.bottom) {
			pool = ItemBalancing.lootTables.bottom;
		} else {
			pool = ItemBalancing.lootTables.mid;
		}

		const totalItemWeights = Object.values(pool).reduce((acc, weight) => acc + weight, 0);
		let randomNum = Math.random() * totalItemWeights;

		let itemToGive: ItemType = ItemType.SHIELD;
		for (const [item, weight] of Object.entries(pool)) {
			randomNum -= weight;
			if (randomNum <= 0) {
				itemToGive = parseInt(item) as ItemType;
				break;
			}
		}

		this.givenItems.set(conn.id, itemToGive);
		fullPlayerItems.push({ itemType: itemToGive });
		this.server.playerItems.set(conn.id, fullPlayerItems);

		const envelope: ServerMessage = {
			type: MessageType.PULL_STATE_ITEM,
			yourItem: itemToGive,
		};

		conn.send(JSON.stringify(envelope));
	}

	broadcastReadyPlayers() {
		const envelope: ServerMessage = {
			type: MessageType.PULL_STATE_READY,
			readyPlayers: this.readyPlayers,
		};

		this.server.room.broadcast(JSON.stringify(envelope));
	}
}
