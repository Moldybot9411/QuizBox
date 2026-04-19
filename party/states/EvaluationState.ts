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
import {
	CORRECT_ANSWER_SCORE_MAX,
	CORRECT_ANSWER_SCORE_MIN,
	ROUND_DURATION,
} from '../../src/lib/shared/gameSettings';

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

	calculateScore(playerId: string): number {
		const playerAnswer = this.server.playerAnswers.get(playerId);

		if (!playerAnswer) {
			return 0;
		}

		const questionData = this.server.triviaData?.results[this.server.gameState.currentRound]!;

		if (questionData.correct_answer !== playerAnswer.answer) {
			return 0;
		}

		const score =
			CORRECT_ANSWER_SCORE_MIN +
			(CORRECT_ANSWER_SCORE_MAX - CORRECT_ANSWER_SCORE_MIN) *
				(1 - playerAnswer.timeDelta / ROUND_DURATION);

		return Math.round(score);
	}

	sendResult(connection: Connection) {
		const playerAnswer = this.server.playerAnswers.get(connection.id);
		const questionData = this.server.triviaData?.results[this.server.gameState.currentRound];

		const playerAnswerStatus = playerAnswer
			? questionData?.correct_answer === playerAnswer.answer
				? 'correct'
				: 'wrong'
			: 'no_answer';
		const score = this.calculateScore(connection.id);

		const envelope: ServerMessage = {
			type: MessageType.ROUND_RESULT,
			result: playerAnswerStatus,
			timeDelta: playerAnswer?.timeDelta ?? 0,
			score: score,
		};

		connection.send(JSON.stringify(envelope));
	}
}
