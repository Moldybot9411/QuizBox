<script lang="ts">
	import { backToLobby, gameData, submitAnswer } from '$lib/gameStore.svelte';
	import { decode } from 'html-entities';
	import Button from './Button.svelte';
	import Card from './Card.svelte';
	import ProgressBar from './ProgressBar.svelte';
	import Countdown from './Countdown.svelte';
	import { onDestroy, onMount } from 'svelte';

	const timeOffset = Date.now() - (gameData.questionData?.serverTime ?? Date.now());

	let phase: 'BUFFER' | 'COUNTDOWN' | 'PLAYING' = $state('BUFFER');
	let bufferDisplayTime = $state(0);
	let remainingTime = $state(10.0);
	let animationFrameId: number;

	let selectedIndex = $state(gameData.yourAnswer);
	let progress = $derived.by(() => (remainingTime / 10.0) * 100);
	let countdownFinished = $derived.by(() => phase !== 'COUNTDOWN');

	function gameLoop() {
		const syncedNow = Date.now() - timeOffset;
		const revealTime = gameData.questionData?.revealTime!;
		const endTime = gameData.questionData?.endTime!;

		if (syncedNow < revealTime) {
			const remainingToReveal = revealTime - syncedNow;

			if (remainingToReveal > 3000) {
				phase = 'BUFFER';
			} else {
				phase = 'COUNTDOWN';
				bufferDisplayTime = Math.ceil(remainingToReveal / 1000);
			}
		} else if (syncedNow < endTime) {
			phase = 'PLAYING';
			const remainingToAnswer = endTime - syncedNow;

			remainingTime = remainingToAnswer / 1000;
		} else {
			remainingTime = 0;
			cancelAnimationFrame(animationFrameId);
			return;
		}

		animationFrameId = requestAnimationFrame(gameLoop);
	}

	onMount(() => {
		gameLoop();
	});

	onDestroy(() => {
		cancelAnimationFrame(animationFrameId);
	});
</script>

<div class="flex min-h-[calc(100dvh-2rem)] w-full flex-col items-center justify-center gap-8">
	<div class="flex w-full max-w-2xl flex-col items-center">
		<span class="text-muted-foreground mb-2 self-start text-sm font-medium">
			Question {gameData.state.currentRound + 1}/{gameData.state.numRounds}
		</span>

		<ProgressBar value={progress} class="mb-2" />

		<Card
			elevation="high"
			class="w-full p-6 text-center text-xl font-bold text-balance md:text-2xl">
			{decode(gameData.questionData?.question)}
		</Card>
	</div>

	{#if countdownFinished && phase === 'PLAYING'}
		<div class="grid w-full max-w-2xl grid-cols-2 gap-4">
			{#each gameData.questionData?.answers as option, index}
				<button
					disabled={selectedIndex !== undefined ? true : undefined}
					onclick={() => {
						selectedIndex = index;
						submitAnswer(index);
					}}
					class={[
						'elevation-low highlight text-l flex min-h-30 w-full items-center justify-center rounded-md',
						'bg-surface p-4 text-center transition-transform select-none md:text-xl',
						selectedIndex === undefined &&
							'cursor-pointer hover:bg-secondary-hover active:scale-95',
						selectedIndex !== undefined &&
							selectedIndex !== index &&
							'bg-surface-dark text-text-muted',
						selectedIndex === index && 'elevation-high',
					]}>
					{decode(option)}
				</button>
			{/each}
		</div>
	{:else}
		<Countdown
			class="flex w-full justify-center"
			duration={bufferDisplayTime}
			onfinish={() => (countdownFinished = true)} />
	{/if}

	{#if gameData.isAdmin}
		<Button onclick={backToLobby} class="fixed top-4 left-4 w-fit" label="Back to Lobby" />
	{/if}
</div>
