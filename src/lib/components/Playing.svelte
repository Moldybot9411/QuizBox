<script>
	import { backToLobby, gameData, submitAnswer } from '$lib/gameStore.svelte';
	import { decode } from 'html-entities';
	import Button from './Button.svelte';
	import Card from './Card.svelte';

	let selectedIndex = $state(gameData.yourAnswer);
</script>

<div class="flex min-h-[calc(100dvh-2rem)] w-full flex-col items-center justify-center gap-8">
	<div class="flex w-full max-w-2xl flex-col items-center">
		<span class="text-muted-foreground mb-2 self-start text-sm font-medium">
			Question {gameData.state.currentRound + 1}/{gameData.state.numRounds}
		</span>

		<Card
			elevation="high"
			class="w-full p-6 text-center text-xl font-bold text-balance md:text-2xl">
			{decode(gameData.state.question)}
		</Card>
	</div>

	<div class="grid w-full max-w-2xl grid-cols-2 gap-4">
		{#each gameData.state.options as option, index}
			<button
				disabled={selectedIndex ? true : undefined}
				onclick={() => {
					selectedIndex = index;
					submitAnswer(index);
				}}
				class={[
					'elevation-low highlight text-l flex min-h-30 w-full items-center justify-center rounded-md',
					'bg-surface p-4 text-center transition-transform select-none md:text-xl',
					!selectedIndex && 'cursor-pointer hover:bg-secondary-hover active:scale-95',
					selectedIndex && selectedIndex !== index && 'bg-surface-dark text-text-muted',
					selectedIndex === index && 'elevation-high',
				]}>
				{decode(option)}
			</button>
		{/each}
	</div>

	{#if gameData.isAdmin}
		<Button onclick={backToLobby} class="fixed top-4 left-4 w-fit" label="Back to Lobby" />
	{/if}
</div>
