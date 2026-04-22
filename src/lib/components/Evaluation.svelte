<script lang="ts">
	import { backToLobby, gameData, nextRound } from '$lib/gameStore.svelte';
	import { Check, MoveRight, X } from '@lucide/svelte';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import { decode } from 'html-entities';
	import ProgressBar from './ProgressBar.svelte';

	let answerStats: { answer: string; numPicks: number }[] = $state([]);
	let totalAnswers: number = $derived.by(() => {
		let res = 0;
		answerStats.forEach((el) => (res += el.numPicks));
		return res;
	});

	$effect(() => {
		if (gameData.lastAnswerStats) {
			let stats: { answer: string; numPicks: number }[] = [];

			for (const answer of Object.keys(gameData.lastAnswerStats)) {
				stats.push({ answer, numPicks: gameData.lastAnswerStats[answer] });
			}

			stats = stats.sort((a, b) => b.numPicks - a.numPicks);

			answerStats = stats;
		}
	});
</script>

<h1 class="flex min-h-12 items-center pr-16 text-3xl font-bold text-balance">
	{decode(gameData.questionData?.question)}
</h1>

<div class="mt-8 mb-2 flex w-full flex-col gap-2 md:flex-row">
	<Card elevation="high" class="flex-3">
		<span class="flex items-center gap-2">
			<h2 class="text-2xl font-bold">Result</h2>
			{#if gameData.roundResult?.result === 'correct'}
				<Check size={32} class="text-surface-success" />
			{:else}
				<X size={32} class="text-surface-error" />
			{/if}
		</span>
		<div class="text-text-muted">
			{#if gameData.roundResult?.result !== 'no_answer'}
				<span>
					You answered in {(gameData.roundResult?.timeDelta ?? 0) / 1000}s!
				</span>
			{/if}

			<div class="mt-2 grid grid-cols-2 gap-2">
				{#each gameData.questionData?.answers as answer}
					<Card
						class={[
							'flex items-center justify-center text-center text-lg text-balance text-text-muted',
							gameData.state.lastCorrectAnswer === answer &&
								'bg-surface-success! text-text-invert!',
							gameData.yourAnswer?.text === answer &&
								gameData.state.lastCorrectAnswer !== answer &&
								'bg-surface-error! text-text-invert!',
						]}>
						{decode(answer)}
					</Card>
				{/each}
			</div>
		</div>
	</Card>

	<Card elevation="medium" class={['flex flex-1 items-center justify-center p-8 md:p-16']}>
		<div
			class={[
				'text-6xl font-bold',
				(gameData.roundResult?.score ?? 0) > 0 ? 'text-surface-success' : 'text-surface-error',
			]}>
			{(gameData.roundResult?.score ?? 0) >= 0 && '+'}{gameData.roundResult?.score ?? 0}
		</div>
	</Card>
</div>

<Card elevation="low" class="mb-4">
	<span class="text-2xl font-bold"> Stats: </span>
	{#each answerStats as answer}
		<div class="mb-4 last:mb-0">
			<span class="mb-1 flex w-full justify-between gap-4 text-text-muted">
				<span>{decode(answer.answer)}</span>
				<span>{totalAnswers ? ((answer.numPicks / totalAnswers) * 100).toFixed(2) : 0}%</span>
			</span>
			<ProgressBar color="info" value={totalAnswers ? (answer.numPicks / totalAnswers) * 100 : 0} />
		</div>
	{/each}
</Card>

{#if gameData.isAdmin}
	<div class="flex w-full gap-2">
		<Button label="Back to Lobby" class="ml-auto" variant="secondary" onclick={backToLobby} />
		<Button label="Next Round" onclick={nextRound} icon={MoveRight} />
	</div>
{/if}
