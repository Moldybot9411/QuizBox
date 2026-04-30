import z from 'zod';
import { ItemType } from './items';

// General state the game is currently in
export enum State {
	LOBBY,
	ITEM_PULL,
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
	ROUND_RESULT, // Your own result (Answer, Score)
	ROUND_DIGEST, // Correct Answer
	SCOREBOARD,
	ITEM_PULL_READY,
	ITEM_PULL_ITEM,
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
	PULL_STATE_READY,
}

export const GameStateSchema = z.object({
	state: z.enum(State),
	createdAt: z.number(),
	playerCount: z.number(),
	numRounds: z.number(),
	currentRound: z.number(),
	adminId: z.string(),
	players: z.array(z.object({ id: z.string(), name: z.string() })),
	scoreBoard: z.record(
		z.string(),
		z.object({
			totalScore: z.number(),
			name: z.string(),
			numCorrectAnswers: z.number(),
		})
	),
	lastAnswerStats: z.record(z.string(), z.number()),
	lastCorrectAnswer: z.string(),
});

export type GameState = z.infer<typeof GameStateSchema>;
export type Player = z.infer<typeof GameStateSchema.shape.players.element>;

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
	text: z.string().optional(),
});
export type YourAnswerData = z.infer<typeof YourAnswerMessageSchema>;

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

const RoundDigestMessageSchema = z.object({
	type: z.literal(MessageType.ROUND_DIGEST),
	questionData: QuestionPreviewMessageScheme.pick({ question: true, answers: true }),
	answerStats: GameStateSchema.shape.lastAnswerStats,
	lastCorrectAnswer: z.string(),
});
export type AnswerStats = z.infer<typeof RoundDigestMessageSchema.shape.answerStats>;

const ScoreboardMessageSchema = z.object({
	type: z.literal(MessageType.SCOREBOARD),
	scoreBoard: GameStateSchema.shape.scoreBoard,
});

// ====== Item Pull State ======
const ItemPullReadyMessageSchema = z.object({
	type: z.literal(MessageType.ITEM_PULL_READY),
	readyPlayers: z.array(GameStateSchema.shape.players.element),
});

const ItemPullItemMessageSchema = z.object({
	type: z.literal(MessageType.ITEM_PULL_ITEM),
	yourItem: z.enum(ItemType),
});

const ItemPullCombinedSchema = z
	.object({
		...ItemPullReadyMessageSchema.shape,
		...ItemPullItemMessageSchema.shape,
	})
	.omit({ type: true });
export type ItemPullData = z.infer<typeof ItemPullCombinedSchema>;
// ============

export const ServerMessageSchema = z.discriminatedUnion('type', [
	SyncMessageSchema,
	PlayerCountMessageSchema,
	CounterUpdateMessageSchema,
	AdminChangeMessageSchema,
	AdminSecretMessageSchema,
	YourAnswerMessageSchema,
	QuestionPreviewMessageScheme,
	RoundResultMessageSchema,
	RoundDigestMessageSchema,
	ScoreboardMessageSchema,
	ItemPullReadyMessageSchema,
	ItemPullItemMessageSchema,
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
		scoreBoard: {},
		lastAnswerStats: {},
		lastCorrectAnswer: '',
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

const ChestOpenedActionMessage = z.object({
	action: z.literal(ActionMessage.PULL_STATE_READY),
});

export const ClientMessageSchema = z.discriminatedUnion('action', [
	StartGameActionMessage,
	IncreaseCounterActionMessage,
	ResetActionMessage,
	BackToLobbyActionMessage,
	ChangeNameActionMessage,
	SubmitAnswerActionMessage,
	NextRoundActionMessage,
	ChestOpenedActionMessage,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
