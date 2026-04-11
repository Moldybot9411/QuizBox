<script>
	import { backToLobby, gameData } from '$lib/gameStore.svelte';
	import { decode } from 'html-entities';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
</script>

<div class="flex min-h-[calc(100dvh-2rem)] w-full flex-col gap-8">
	<div>
		Question {gameData.state.currentRound + 1}/{gameData.state.numRounds}

		<Card elevation="high" class="mt-2 w-fit">
			{decode(gameData.state.question)}
		</Card>
	</div>

	<div class="flex-basis-md flex flex-row gap-4">
		{#each gameData.state.options as option}
			<Card class="min-w-80">
				{decode(option)}
			</Card>
		{/each}
	</div>

	{#if gameData.isAdmin}
		<Button onclick={backToLobby} class="w-fit" label="Back to Lobby" />
	{/if}
</div>
