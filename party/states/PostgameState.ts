import { Connection } from 'partykit/server';
import {
	ActionMessage,
	ClientMessage,
	MessageType,
	ServerMessage,
	State,
} from '../../src/lib/shared/schema';
import type Server from '../server';
import { GameStateHandler } from './GameStateHandler';

export class PostgameState implements GameStateHandler {
	constructor(private server: Server) {}

	onEnter(): void {
		// Send Scoreboard
		const envelope: ServerMessage = {
			type: MessageType.SCOREBOARD,
			scoreBoard: this.server.gameState.scoreBoard,
		};

		this.server.room.broadcast(JSON.stringify(envelope));
	}

	/*onConnect(connection: Connection): void {
		// Scoreboard doesn't need to be sent because it's in the gameState, which gets synced by the server on connect.
	}*/

	onMessage(_message: ClientMessage, _sender: Connection): void {}
}
