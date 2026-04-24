import { gameData } from './gameStore.svelte';

export function getSortedScoreboard() {
	const res = Object.entries(gameData.state.scoreBoard).map(([id, player]) => ({
		id,
		name: player.name,
		totalScore: player.totalScore,
		numCorrectAnswers: player.numCorrectAnswers,
	}));

	return res.sort(
		(a, b) =>
			b.totalScore - a.totalScore ||
			b.numCorrectAnswers - a.numCorrectAnswers ||
			a.name.localeCompare(b.name)
	);
}

export function getTotalScore() {
	const playerData = gameData.state.scoreBoard[gameData.socket?.id ?? ''];

	return playerData.totalScore ?? 0;
}
