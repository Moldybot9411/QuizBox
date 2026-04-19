<script lang="ts">
	import { backToLobby, gameData, nextRound } from '$lib/gameStore.svelte';
	import { Check, MoveRight, X } from '@lucide/svelte';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import { decode } from 'html-entities';

	let answerStats: { answer: string; numPicks: number }[] = $state([]);

	$effect(() => {
		if (gameData.lastAnswerStats) {
			let stats: { answer: string; numPicks: number }[] = [];

			for (const answer of Object.keys(gameData.lastAnswerStats)) {
				stats.push({ answer, numPicks: gameData.lastAnswerStats[answer] });
			}

			stats = stats.sort((_, b) => b.numPicks);

			answerStats = stats;
		}
	});
</script>

<h1 class="flex min-h-12 items-center pr-16 text-3xl font-bold text-balance">
	{decode(gameData.questionData?.question)}
</h1>

<div class="mt-8 mb-2 flex w-full flex-col gap-2 md:flex-row">
	<Card elevation="low" class="w-full">
		<span class="flex items-center gap-2">
			<h2 class="text-2xl font-bold">Result</h2>
			{#if gameData.roundResult?.result === 'correct'}
				<Check size={32} class="text-lime-500" />
			{:else}
				<X size={32} class="text-red-500" />
			{/if}
		</span>
		<div class="text-text-muted">
			<div>
				You answered in {(gameData.roundResult?.timeDelta ?? 0) / 1000}s!
			</div>

			<div class="mt-2 grid grid-cols-2 gap-2">
				{#each gameData.questionData?.answers as answer}
					<Card
						class={[
							'text-center text-lg',
							gameData.state.lastCorrectAnswer === answer && 'bg-lime-500!',
							gameData.yourAnswer?.text === answer &&
								gameData.state.lastCorrectAnswer !== answer &&
								'bg-red-500!',
						]}>
						{answer}
					</Card>
				{/each}
			</div>
		</div>
	</Card>

	<Card elevation="low" class="w-full">
		<div>
			Options: {decode(gameData.questionData?.answers.join(' | '))}
		</div>
		<div>
			Correct Answer: {decode(gameData.state.lastCorrectAnswer)}
		</div>
		<div>
			Your Answer: {decode(gameData.yourAnswer?.text)}
		</div>
	</Card>
</div>

<Card elevation="low" class="mb-4">
	<span class="text-2xl font-bold text-text-muted"> Stats: </span>
	{#each answerStats as answer}
		<div>
			{decode(answer.answer)}: {answer.numPicks}
		</div>
	{/each}
</Card>

{#if gameData.isAdmin}
	<div class="flex w-full gap-2">
		<Button label="Back to Lobby" class="ml-auto" variant="secondary" onclick={backToLobby} />
		<Button label="Next Round" onclick={nextRound} icon={MoveRight} />
	</div>
{/if}
