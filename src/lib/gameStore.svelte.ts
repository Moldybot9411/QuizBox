import { PUBLIC_PARTYKIT_HOST } from '$env/static/public';
import PartySocket from 'partysocket';
import {
	ActionMessage,
	createDefaultState,
	MessageType,
	ServerMessageSchema,
	State,
	type ClientMessage,
	type GameState,
	type QuestionData,
	type RoundResult,
	type TriviaData,
} from '$lib/shared/schema';

type GameData = {
	state: GameState;
	socket?: PartySocket;
	readonly isAdmin: boolean;
	adminSecret?: string;
	yourAnswer?: number;
	questionData?: QuestionData;
	roundResult?: RoundResult;
};

export const gameData: GameData = $state({
	state: createDefaultState(),
	socket: undefined as PartySocket | undefined,
	get isAdmin(): boolean {
		return !!(this.socket && this.state?.adminId && this.socket.id === this.state.adminId);
	},
	adminSecret: undefined as string | undefined,
});

export function initGame(
	roomId: string,
	onstatechange: (oldstate: State, newState: State) => void
) {
	const lastId = sessionStorage.getItem('lastId');
	const lastName = sessionStorage.getItem('lastName');

	gameData.socket = new PartySocket({
		host: PUBLIC_PARTYKIT_HOST,
		room: roomId,
		id: lastId ?? undefined,
	});

	sessionStorage.setItem('lastId', gameData.socket.id);

	if (lastName) {
		changeName(lastName);
	}

	gameData.socket.addEventListener('message', (event) => {
		try {
			const rawData = JSON.parse(event.data);
			const message = ServerMessageSchema.parse(rawData);

			switch (message.type) {
				case MessageType.SYNC:
					if (gameData.state.state !== message.gameState.state) {
						onstatechange(gameData.state.state, message.gameState.state);
					}

					gameData.state = message.gameState;
					break;

				case MessageType.PLAYERUPDATE:
					gameData.state.playerCount = message.playerCount;
					gameData.state.players = message.players;
					break;

				case MessageType.ADMINCHANGE:
					gameData.state.adminId = message.adminId;
					break;

				case MessageType.ADMINSECRET:
					gameData.adminSecret = message.secret;
					break;

				case MessageType.YOUR_ANSWER:
					gameData.yourAnswer = message.index;
					break;

				case MessageType.QUESTION_PREVIEW:
					gameData.questionData = message;
					break;

				case MessageType.ROUND_RESULT:
					gameData.roundResult = message;
					break;
			}
		} catch (error) {
			console.error('Received wrong message from Server:', error);
			return;
		}
	});
}

export async function doesRoomExist(roomId: string): Promise<boolean> {
	const resp = await fetch(`${PUBLIC_PARTYKIT_HOST}/parties/api/roomExists`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ roomId: roomId }),
	});

	return resp.ok;
}

export function increaseCounter() {
	const obj: ClientMessage = {
		action: ActionMessage.INCREASE_COUNTER,
	};

	gameData.socket?.send(JSON.stringify(obj));
}

export function reset() {
	const obj: ClientMessage = {
		action: ActionMessage.RESET,
		adminSecret: gameData.adminSecret ?? '',
	};

	gameData.socket?.send(JSON.stringify(obj));
}

export function startGame(triviaData: TriviaData) {
	const obj: ClientMessage = {
		action: ActionMessage.START_GAME,
		adminSecret: gameData.adminSecret ?? '',
		triviaData,
	};

	gameData.socket?.send(JSON.stringify(obj));
}

export function backToLobby() {
	const obj: ClientMessage = {
		action: ActionMessage.BACK_TO_LOBBY,
		adminSecret: gameData.adminSecret ?? '',
	};

	gameData.socket?.send(JSON.stringify(obj));
}

export function changeName(name: string) {
	const obj: ClientMessage = {
		action: ActionMessage.CHANGE_NAME,
		name,
	};

	if (!gameData.state.players.find((el) => el.name === name.trim()) && name.trim().length <= 25) {
		sessionStorage.setItem('lastName', name);
	}

	gameData.socket?.send(JSON.stringify(obj));
}

export function submitAnswer(index: number) {
	const obj: ClientMessage = {
		action: ActionMessage.SUBMIT_ANSWER,
		index,
	};

	gameData.socket?.send(JSON.stringify(obj));
}

export function nextRound() {
	const obj: ClientMessage = {
		action: ActionMessage.NEXT_ROUND,
	};

	gameData.socket?.send(JSON.stringify(obj));
}
