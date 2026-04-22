<script lang="ts">
	import { backToLobby, gameData } from '$lib/gameStore.svelte';
	import { House } from '@lucide/svelte';
	import Button from './Button.svelte';
	import Podest from './Podest.svelte';
	import ProgressBar from './ProgressBar.svelte';

	let scoreBoard = $derived(gameData.state.scoreBoard);

	let scoreBoardArray = $derived.by(() => {
		let res: { name: string; totalScore: number; numCorrectAnswers: number }[] = [];

		for (const id of Object.keys(scoreBoard)) {
			res.push({
				name: scoreBoard[id].name,
				totalScore: scoreBoard[id].totalScore,
				numCorrectAnswers: scoreBoard[id].numCorrectAnswers,
			});
		}

		res = res.sort(
			(a, b) =>
				b.totalScore - a.totalScore ||
				b.numCorrectAnswers - a.numCorrectAnswers ||
				a.name.localeCompare(b.name)
		);

		return res;
	});
</script>

<div class="mt-20 flex h-100 flex-col items-center justify-center gap-2 md:flex-row md:items-end">
	{#if scoreBoardArray.length >= 2}
		<Podest
			class="order-2 md:order-1 {scoreBoardArray.length == 2 && 'order-3!'}"
			placement={2}
			playerName={scoreBoardArray[1].name}
			score={scoreBoardArray[1].totalScore}
			numCorrectAnswers={scoreBoardArray[1].numCorrectAnswers} />
	{/if}

	{#if scoreBoardArray.length >= 1}
		<Podest
			class="order-1 md:order-2"
			placement={1}
			playerName={scoreBoardArray[0].name}
			score={scoreBoardArray[0].totalScore}
			numCorrectAnswers={scoreBoardArray[0].numCorrectAnswers} />
	{/if}

	{#if scoreBoardArray.length >= 3}
		<Podest
			class="order-3"
			placement={3}
			playerName={scoreBoardArray[2].name}
			score={scoreBoardArray[2].totalScore}
			numCorrectAnswers={scoreBoardArray[2].numCorrectAnswers} />
	{/if}
</div>

{#if gameData.isAdmin}
	<Button
		icon={House}
		class="my-8 ml-auto"
		variant="tertiary"
		onclick={backToLobby}
		label="Return to Lobby" />
{/if}

{#if scoreBoardArray.length >= 4}
	<hr class="my-4 border-border" />
	<div class="mb-2 text-2xl font-bold">The Rest</div>

	<div class="highlight overflow-hidden rounded-md border border-border">
		<table class="w-full min-w-max table-auto rounded-md text-left">
			<thead>
				<tr class="border-b border-border bg-surface">
					<th class="p-2">Name</th>
					<th class="p-2">Score</th>
					<th class="p-2">Correct Answers</th>
				</tr>
			</thead>
			<tbody>
				{#each scoreBoardArray.slice(3) as player}
					{@const percentage = player.numCorrectAnswers
						? (player.numCorrectAnswers / gameData.state.numRounds) * 100
						: 0}
					<tr class="border-b border-border bg-surface-light text-text-muted last:border-b-0">
						<td class="p-2">
							{player.name}
						</td>
						<td class="p-2">
							{player.totalScore}
						</td>
						<td class="p-2">
							<ProgressBar
								color={percentage >= 50 ? 'success' : percentage > 20 ? 'warning' : 'error'}
								value={percentage} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

{#if !gameData.isAdmin}
	<div class="mt-8">Waiting for admin to return to lobby...</div>
{/if}
