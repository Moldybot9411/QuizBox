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

export class LobbyState implements GameStateHandler {
	constructor(private server: Server) {}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.START_GAME:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) {
					break;
				}

				if (message.triviaData.response_code !== 0) {
					break;
				}

				if (this.server.gameState.playerCount < 2) {
					break;
				}

				this.server.triviaData = message.triviaData;

				this.server.gameState.numRounds = message.triviaData.results.length;

				this.server.transitionTo(State.PLAYING);
				break;

			case ActionMessage.CHANGE_NAME:
				/**
				 * Player name must:
				 * - Not be empty
				 * - Not be longer than 20 characters
				 * - Not already exist in the lobby
				 */
				const player = this.server.gameState.players.find((p) => p.id === sender.id);

				if (!player) {
					break;
				}

				const nameExists = this.server.gameState.players.some(
					(p) => p.name.trim() === message.name.trim()
				);

				if (nameExists) {
					break;
				}

				if (!message.name.trim()) {
					break;
				}

				if (message.name.trim().length > 20) {
					break;
				}

				player.name = message.name.trim();

				const envelope: ServerMessage = {
					type: MessageType.PLAYERUPDATE,
					playerCount: this.server.gameState.playerCount,
					players: this.server.gameState.players,
				};

				this.server.room.broadcast(JSON.stringify(envelope));
		}
	}
}
