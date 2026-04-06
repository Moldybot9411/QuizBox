import z from 'zod';

// General state the game is currently in
export enum State {
	LOBBY,
	PLAYING,
	POSTGAME,
}

// Message type ( Server -> Client )
export enum MessageType {
	SYNC,
	PLAYERUPDATE,
	COUNTERUPDATE,
	ADMINCHANGE,
	ADMINSECRET,
}

// Action Message ( Client -> Server )
export enum ActionMessage {
	START_GAME,
	INCREASE_COUNTER,
	RESET,
	BACK_TO_LOBBY,
	CHANGE_NAME,
}

export enum ItemType {
	DOUBLETIMER,
	STEALPOINTS,
	SHIELD,
}

export const GameStateSchema = z.object({
	state: z.enum(State),
	createdAt: z.number(),
	playerCount: z.number(),
	numRounds: z.number(),
	currentRound: z.number(),
	question: z.string(),
	options: z.array(z.string()),
	adminId: z.string(),
	players: z.array(z.object({ id: z.string(), name: z.string() })),
});

export type GameState = z.infer<typeof GameStateSchema>;

const SyncMessageSchema = z.object({
	type: z.literal(MessageType.SYNC),
	gameState: GameStateSchema,
});

const PlayerCountMessageSchema = z.object({
	type: z.literal(MessageType.PLAYERUPDATE),
	playerCount: z.number(),
	players: z.array(z.object({ id: z.string(), name: z.string() })),
});

const CounterUpdateMessageSchema = z.object({
	type: z.literal(MessageType.COUNTERUPDATE),
	counter: z.number(),
});

const AdminChangeMessageSchema = z.object({
	type: z.literal(MessageType.ADMINCHANGE),
	adminId: z.string(),
});

const AdminSecretMessageSchema = z.object({
	type: z.literal(MessageType.ADMINSECRET),
	secret: z.string(),
});

export const ServerMessageSchema = z.discriminatedUnion('type', [
	SyncMessageSchema,
	PlayerCountMessageSchema,
	CounterUpdateMessageSchema,
	AdminChangeMessageSchema,
	AdminSecretMessageSchema,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>;

export const TriviaSchema = z.object({
	response_code: z.number(),
	results: z.array(
		z.object({
			type: z.enum(['multiple', 'boolean']),
			difficulty: z.enum(['easy', 'medium', 'hard']),
			category: z.string(),
			question: z.string(),
			correct_answer: z.string(),
			incorrect_answers: z.array(z.string()),
		})
	),
});

export type TriviaData = z.infer<typeof TriviaSchema>;

export function createDefaultState(): GameState {
	return {
		state: State.LOBBY,
		createdAt: Date.now(),
		playerCount: 0,
		numRounds: 10,
		currentRound: 0,
		question: '',
		options: [],
		adminId: '',
		players: [],
	};
}

const StartGameActionMessage = z.object({
	action: z.literal(ActionMessage.START_GAME),
	adminSecret: z.string(),
	triviaData: TriviaSchema,
});

const IncreaseCounterActionMessage = z.object({
	action: z.literal(ActionMessage.INCREASE_COUNTER),
});

const ResetActionMessage = z.object({
	action: z.literal(ActionMessage.RESET),
	adminSecret: z.string(),
});

const BackToLobbyActionMessage = z.object({
	action: z.literal(ActionMessage.BACK_TO_LOBBY),
	adminSecret: z.string(),
});

const ChangeNameActionMessage = z.object({
	action: z.literal(ActionMessage.CHANGE_NAME),
	name: z.string(),
});

export const ClientMessageSchema = z.discriminatedUnion('action', [
	StartGameActionMessage,
	IncreaseCounterActionMessage,
	ResetActionMessage,
	BackToLobbyActionMessage,
	ChangeNameActionMessage,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
