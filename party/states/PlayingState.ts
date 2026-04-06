import { Connection } from 'partykit/server';
import { ActionMessage, ClientMessage } from '../../src/lib/shared/schema';
import type Server from '../server';
import { GameStateHandler } from './GameStateHandler';

export class PlayingState implements GameStateHandler {
	constructor(private server: Server) {}

	onEnter(): void {
		this.server.gameState.currentRound = 0;
		this.server.gameState.numRounds = this.server.triviaData?.results.length || 0;
		this.server.gameState.question =
			this.server.triviaData?.results[this.server.gameState.currentRound].question || '';
		this.server.gameState.options = this.server.triviaData?.results[
			this.server.gameState.currentRound
		]
			? [
					...this.server.triviaData.results[this.server.gameState.currentRound].incorrect_answers,
					this.server.triviaData.results[this.server.gameState.currentRound].correct_answer,
				]
			: [];

		this.server.broadcastSync();
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.BACK_TO_LOBBY:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) break;

				this.server.softReset();

				this.server.broadcastSync();
				break;
		}
	}
}
