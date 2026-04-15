import { Connection } from 'partykit/server';
import Server from '../server';
import { GameStateHandler } from './GameStateHandler';
import {
	ActionMessage,
	ClientMessage,
	MessageType,
	ServerMessage,
	State,
} from '../../src/lib/shared/schema';

export class EvaluationState implements GameStateHandler {
	constructor(private server: Server) {}

	onEnter(): void {
		const allConnections = Array.from(this.server.room.getConnections());

		for (const conn of allConnections) {
			this.sendResult(conn);
		}
	}

	onConnect(connection: Connection): void {
		this.sendResult(connection);
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.NEXT_ROUND:
				const numRounds = this.server.triviaData?.results.length ?? 0;

				if (this.server.gameState.currentRound < numRounds - 1) {
					this.server.gameState.currentRound++;

					this.server.transitionTo(State.PLAYING);
					break;
				}

				this.server.transitionTo(State.POSTGAME);

				break;
			case ActionMessage.BACK_TO_LOBBY:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) break;

				this.server.softReset();

				this.server.broadcastSync();
				break;
		}
	}

	onLeave(): void {
		this.server.playerAnswers = new Map();
		const envelope: ServerMessage = {
			type: MessageType.YOUR_ANSWER,
			index: undefined,
		};

		this.server.room.broadcast(JSON.stringify(envelope));
	}

	sendResult(connection: Connection) {
		const playerAnswer = this.server.playerAnswers.get(connection.id);
		const questionData = this.server.triviaData?.results[this.server.gameState.currentRound];

		const envelope: ServerMessage = {
			type: MessageType.ROUND_RESULT,
			result: playerAnswer
				? questionData?.correct_answer === playerAnswer.answer
					? 'correct'
					: 'wrong'
				: 'no_answer',
			timeDelta: playerAnswer?.timeDelta ?? -1,
			score: 69,
		};

		connection.send(JSON.stringify(envelope));
	}
}
