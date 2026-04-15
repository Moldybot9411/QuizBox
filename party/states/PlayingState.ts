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

export class PlayingState implements GameStateHandler {
	constructor(private server: Server) {
		this.question =
			this.server.triviaData?.results[this.server.gameState.currentRound].question || '';
		this.answers = this.server.triviaData?.results[this.server.gameState.currentRound]
			? [
					...this.server.triviaData.results[this.server.gameState.currentRound].incorrect_answers,
					this.server.triviaData.results[this.server.gameState.currentRound].correct_answer,
				].sort(() => Math.random() - 0.5)
			: [];
		this.serverNow = Date.now();
		this.revealTime = this.serverNow + this.networkBuffer + this.countdownDuration;
		this.endTime = this.revealTime + this.roundDuration;
	}

	networkBuffer = 1000;
	countdownDuration = 3000;
	roundDuration = 10000;

	question: string;
	answers: string[];
	serverNow: number;
	revealTime: number;
	endTime: number;

	timeoutId: number | undefined;

	onConnect(connection: Connection): void {
		const questionData: ServerMessage = {
			type: MessageType.QUESTION_PREVIEW,
			question: this.question,
			answers: this.answers,
			serverTime: Date.now(),
			revealTime: this.revealTime,
			endTime: this.endTime,
		};

		connection.send(JSON.stringify(questionData));

		const answer = this.server.playerAnswers.get(connection.id);

		if (!answer) return;

		const envelope: ServerMessage = {
			type: MessageType.YOUR_ANSWER,
			index: answer.index,
		};

		connection.send(JSON.stringify(envelope));
	}

	onEnter(): void {
		const envelope: ServerMessage = {
			type: MessageType.QUESTION_PREVIEW,
			question: this.question,
			answers: this.answers,
			serverTime: this.serverNow,
			revealTime: this.revealTime,
			endTime: this.endTime,
		};

		this.server.room.broadcast(JSON.stringify(envelope));

		this.timeoutId = setTimeout(() => {
			this.server.transitionTo(State.EVALUATION);
		}, this.endTime - this.serverNow);
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.BACK_TO_LOBBY:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) break;

				clearTimeout(this.timeoutId);

				this.server.softReset();

				this.server.broadcastSync();
				break;

			case ActionMessage.SUBMIT_ANSWER:
				if (this.server.playerAnswers.get(sender.id)) break;

				this.server.playerAnswers.set(sender.id, {
					index: message.index,
					answer: this.answers[message.index],
					timeDelta: Date.now() - this.revealTime,
				});

				break;
		}
	}
}
