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
		this.server.gameState.lastCorrectAnswer =
			this.server.getCurrentTriviaData()?.correct_answer ?? '';

		const allConnections = Array.from(this.server.room.getConnections());

		for (const conn of allConnections) {
			this.sendResult(conn);
			this.updateScoreboard(conn);
		}

		const digest = this.getRoundDigest();

		this.server.room.broadcast(JSON.stringify(digest));
	}

	onConnect(connection: Connection): void {
		// Send player's score
		this.sendResult(connection);

		// Send player the round digest
		const digest = this.getRoundDigest();

		connection.send(JSON.stringify(digest));

		// Send player's answer
		const playerAnswer = this.server.playerAnswers.get(connection.id);

		const answer: ServerMessage = {
			type: MessageType.YOUR_ANSWER,
			index: playerAnswer?.index,
			text: playerAnswer?.answer,
		};

		connection.send(JSON.stringify(answer));
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.NEXT_ROUND:
				const numRounds = this.server.triviaData?.results.length ?? 0;

				if (this.server.gameState.currentRound < numRounds - 1) {
					this.server.gameState.currentRound++;

					this.server.transitionTo(State.ITEM_PULL);
					break;
				}

				this.server.transitionTo(State.POSTGAME);

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

	getPlayerResult(connection: Connection): 'correct' | 'wrong' | 'no_answer' {
		const playerAnswer = this.server.playerAnswers.get(connection.id);
		const questionData = this.server.triviaData?.results[this.server.gameState.currentRound];

		return playerAnswer
			? questionData?.correct_answer === playerAnswer.answer
				? 'correct'
				: 'wrong'
			: 'no_answer';
	}

	sendResult(connection: Connection) {
		const playerAnswer = this.server.playerAnswers.get(connection.id);

		const playerAnswerStatus = this.getPlayerResult(connection);
		const score = this.calculateScore(connection.id);

		const playerResult: ServerMessage = {
			type: MessageType.ROUND_RESULT,
			result: playerAnswerStatus,
			timeDelta: playerAnswer?.timeDelta ?? 0,
			score: score,
		};

		const playerAnswerEnvelope: ServerMessage = {
			type: MessageType.YOUR_ANSWER,
			index: playerAnswer?.index,
			text: playerAnswer?.answer,
		};

		connection.send(JSON.stringify(playerResult));
		connection.send(JSON.stringify(playerAnswerEnvelope));
	}

	getRoundDigest(): ServerMessage {
		let answerStats: Record<string, number> = {};
		const triviaData = this.server.getCurrentTriviaData();

		for (const answer of this.server.getCurrentAnswers()) {
			answerStats[answer] = Array.from(this.server.playerAnswers.values()).filter(
				(playerData) => playerData.answer === answer
			).length;
		}

		return {
			type: MessageType.ROUND_DIGEST,
			questionData: {
				question: this.server.getCurrentQuestion(),
				answers: this.server.getCurrentAnswers(),
			},
			answerStats,
			lastCorrectAnswer: triviaData?.correct_answer ?? '',
		};
	}

	updateScoreboard(connection: Connection) {
		const score = this.calculateScore(connection.id);
		const name = this.server.gameState.players.find((el) => el.id === connection.id)?.name;
		const previousEntry = this.server.gameState.scoreBoard[connection.id];
		const playerResult = this.getPlayerResult(connection);

		if (!name) return;

		this.server.gameState.scoreBoard[connection.id] = {
			totalScore: (previousEntry?.totalScore ?? 0) + score,
			name,
			numCorrectAnswers:
				(previousEntry?.numCorrectAnswers ?? 0) + (playerResult === 'correct' ? 1 : 0),
		};
	}
}
