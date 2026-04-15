import z, { literal, number, type TypeOf } from 'zod';

// General state the game is currently in
export enum State {
	LOBBY,
	PLAYING,
	EVALUATION,
	POSTGAME,
}

// Message type ( Server -> Client )
export enum MessageType {
	SYNC,
	PLAYERUPDATE,
	COUNTERUPDATE,
	ADMINCHANGE,
	ADMINSECRET,
	YOUR_ANSWER,
	QUESTION_PREVIEW,
	ROUND_RESULT,
}

// Action Message ( Client -> Server )
export enum ActionMessage {
	START_GAME,
	INCREASE_COUNTER,
	RESET,
	BACK_TO_LOBBY,
	CHANGE_NAME,
	SUBMIT_ANSWER,
	NEXT_ROUND,
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

const YourAnswerMessageSchema = z.object({
	type: z.literal(MessageType.YOUR_ANSWER),
	index: z.number().optional(),
});

const QuestionPreviewMessageScheme = z.object({
	type: z.literal(MessageType.QUESTION_PREVIEW),
	question: z.string(),
	answers: z.array(z.string()),
	serverTime: z.number(),
	revealTime: z.number(),
	endTime: z.number(),
});
export type QuestionData = z.infer<typeof QuestionPreviewMessageScheme>;

const RoundResultMessageSchema = z.object({
	type: z.literal(MessageType.ROUND_RESULT),
	result: z.enum(['correct', 'wrong', 'no_answer']),
	timeDelta: z.number(),
	score: z.number(),
});
export type RoundResult = z.infer<typeof RoundResultMessageSchema>;

export const ServerMessageSchema = z.discriminatedUnion('type', [
	SyncMessageSchema,
	PlayerCountMessageSchema,
	CounterUpdateMessageSchema,
	AdminChangeMessageSchema,
	AdminSecretMessageSchema,
	YourAnswerMessageSchema,
	QuestionPreviewMessageScheme,
	RoundResultMessageSchema,
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

const SubmitAnswerActionMessage = z.object({
	action: z.literal(ActionMessage.SUBMIT_ANSWER),
	index: z.number(),
});

const NextRoundActionMessage = z.object({
	action: z.literal(ActionMessage.NEXT_ROUND),
});

export const ClientMessageSchema = z.discriminatedUnion('action', [
	StartGameActionMessage,
	IncreaseCounterActionMessage,
	ResetActionMessage,
	BackToLobbyActionMessage,
	ChangeNameActionMessage,
	SubmitAnswerActionMessage,
	NextRoundActionMessage,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
