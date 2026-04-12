import { Connection } from 'partykit/server';
import {
	ActionMessage,
	ClientMessage,
	MessageType,
	ServerMessage,
} from '../../src/lib/shared/schema';
import type Server from '../server';
import { GameStateHandler } from './GameStateHandler';

export class PlayingState implements GameStateHandler {
	constructor(private server: Server) {}

	onConnect(connection: Connection): void {
		const answer = this.server.answers.get(connection.id);

		if (!answer) return;

		const envelope: ServerMessage = {
			type: MessageType.YOUR_ANSWER,
			index: answer,
		};

		connection.send(JSON.stringify(envelope));
	}

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
				].sort(() => Math.random() - 0.5)
			: [];

		this.server.broadcastSync();
	}

	onLeave(): void {
		this.server.answers.clear();
		const envelope: ServerMessage = {
			type: MessageType.YOUR_ANSWER,
			index: undefined,
		};

		this.server.room.broadcast(JSON.stringify(envelope));
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.BACK_TO_LOBBY:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) break;

				this.server.softReset();

				this.server.broadcastSync();
				break;

			case ActionMessage.SUBMIT_ANSWER:
				if (this.server.answers.get(sender.id)) break;

				this.server.answers.set(sender.id, message.index);
				console.log(
					'Player',
					sender.id,
					'submitted',
					this.server.gameState.options[message.index],
					'which is',
					this.server.gameState.options[message.index] ===
						this.server.triviaData?.results[this.server.gameState.currentRound].correct_answer
				);
				break;
		}
	}
}
