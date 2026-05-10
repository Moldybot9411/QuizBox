<script lang="ts">
	import { backToLobby, gameData } from '$lib/gameStore.svelte';
	import { House } from '@lucide/svelte';
	import Button from './Button.svelte';
	import Podest from './Podest.svelte';
	import Scoreboard from './Scoreboard.svelte';
	import { getSortedScoreboard } from '$lib/util.svelte';

	let scoreBoardArray = getSortedScoreboard();
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

	<Scoreboard scoreData={scoreBoardArray.slice(3)} startPlacementAt={4} />
{/if}

{#if !gameData.isAdmin}
	<div class="mt-8">Waiting for admin to return to lobby...</div>
{/if}
