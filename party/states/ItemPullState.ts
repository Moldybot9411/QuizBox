import { Connection } from 'partykit/server';
import { ClientMessage } from '../../src/lib/shared/schema';
import Server from '../server';
import { GameStateHandler } from './GameStateHandler';
import { ItemBalancing } from '../../src/lib/shared/gameSettings';
import { ItemType } from '../../src/lib/shared/items';

export class ItemPullState implements GameStateHandler {
	constructor(private server: Server) {
		this.orderedScoreBoard = [];

		for (const player of server.gameState.players) {
			const playerData: (typeof server.gameState.scoreBoard)[''] | undefined =
				server.gameState.scoreBoard[player.id];

			const playerItemCount = server.playerItems.get(player.id)?.length ?? 0;

			this.orderedScoreBoard.push({
				id: player.id,
				name: player.name,
				score: playerData.totalScore ?? 0,
				numCorrectAnswers: playerData.numCorrectAnswers ?? 0,
				numItems: playerItemCount,
			});
		}

		this.orderedScoreBoard = this.orderedScoreBoard.sort(
			(a, b) =>
				b.score - a.score ||
				b.numCorrectAnswers - a.numCorrectAnswers ||
				a.name.localeCompare(b.name)
		);

		this.isFirstRound = this.orderedScoreBoard[0]?.score ? false : true;
	}

	orderedScoreBoard: {
		id: string;
		name: string;
		score: number;
		numCorrectAnswers: number;
		numItems: number;
	}[];
	isFirstRound: boolean;

	onEnter(): void {
		const allConnections = Array.from(this.server.room.getConnections());

		for (const connection of allConnections) {
			this.giveItem(connection);
		}
	}

	onMessage(message: ClientMessage, sender: Connection): void {
		return;
	}

	giveItem(conn: Connection) {
		const playerRank = this.orderedScoreBoard.findIndex((el) => el.id === conn.id);

		// 0.0 -> 1st Place  |  1.0 -> Last Place
		let relativePosition = playerRank === -1 ? 1 : 0.5;
		if (playerRank >= 0 && this.orderedScoreBoard.length > 1) {
			relativePosition = playerRank / (this.orderedScoreBoard.length - 1);
		}

		let pool;
		if (relativePosition <= ItemBalancing.thresholds.top) {
			pool = ItemBalancing.lootTables.top;
		} else if (relativePosition >= ItemBalancing.thresholds.bottom) {
			pool = ItemBalancing.lootTables.bottom;
		} else {
			pool = ItemBalancing.lootTables.mid;
		}

		const totalItemWeights = Object.values(pool).reduce((acc, weight) => (acc += weight), 0);
		let randomNum = Math.random() * totalItemWeights;

		let itemToGive: ItemType;
		for (const [item, weight] of Object.entries(pool)) {
			// randomNum -= weight;
			// if (randomNum <= 0) {
			// 	itemToGive = item as ItemType;
			// }
			console.log(item);
		}
	}
}
