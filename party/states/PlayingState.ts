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
import {
	ROUND_COUNTDOWN_DURATION,
	ROUND_DURATION,
	ROUND_NETWORK_BUFFER_DURATION,
} from '../../src/lib/shared/gameSettings';

export class PlayingState implements GameStateHandler {
	constructor(private server: Server) {
		this.question = this.server.getCurrentQuestion();
		this.answers = this.server.getCurrentAnswers().sort(() => Math.random() - 0.5);
		this.serverNow = Date.now();
		this.revealTime = this.serverNow + this.networkBuffer + this.countdownDuration;
		this.endTime = this.revealTime + this.roundDuration;
	}

	networkBuffer = ROUND_NETWORK_BUFFER_DURATION;
	countdownDuration = ROUND_COUNTDOWN_DURATION;
	roundDuration = ROUND_DURATION;

	question: string;
	answers: string[];
	serverNow: number;
	revealTime: number;
	endTime: number;

	timeoutId: ReturnType<typeof setTimeout> | undefined;

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

		// Send the player's answer from this round
		const answer = this.server.playerAnswers.get(connection.id);

		if (!answer) return;

		const envelope: ServerMessage = {
			type: MessageType.YOUR_ANSWER,
			index: answer.index,
			text: answer.answer,
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

	onLeave(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = undefined;
		}
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.SUBMIT_ANSWER:
				if (this.server.playerAnswers.get(sender.id)) break;

				if (message.index < 0 || message.index >= this.answers.length) {
					break;
				}

				this.server.playerAnswers.set(sender.id, {
					index: message.index,
					answer: this.answers[message.index],
					timeDelta: Date.now() - this.revealTime,
				});

				break;
		}
	}
}
