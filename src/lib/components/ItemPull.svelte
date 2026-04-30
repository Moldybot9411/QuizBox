<script lang="ts">
	import { confetti } from '@neoconfetti/svelte';
	import { resolve } from '$app/paths';
	import Button from './Button.svelte';
	import { Ticket } from '@lucide/svelte';
	import ItemCard from './ItemCard.svelte';
	import { gameData, sendOpenChest } from '$lib/gameStore.svelte';
	import { ItemIcons } from '$lib/itemIcons';
	import { Items } from '$lib/shared/items';

	const confettiDuration = 2000;

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let confettiVisible = $state(false);
	let chestOpen = $state(false);

	$effect(() => {
		if (confettiVisible) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				confettiVisible = false;
			}, confettiDuration);
		}
	});

	function openChest() {
		confettiVisible = true;
		chestOpen = true;

		sendOpenChest();
	}
</script>

<div class="flex min-h-[calc(100dvh-2rem)] w-full flex-col items-center justify-center p-8">
	{#if chestOpen}
		<ItemCard
			name={Items[gameData.itemPullData.yourItem].title}
			icon={ItemIcons[gameData.itemPullData.yourItem]}
			color="primary" />
	{/if}

	{#if confettiVisible}
		<div
			class="fade-out-wrapper mx-auto w-full"
			use:confetti={{
				duration: confettiDuration,
				force: 0.7,
				particleCount: 50,
				particleShape: 'mix',
				stageWidth: 300,
				stageHeight: 300,
			}}>
		</div>
	{/if}

	{#if chestOpen}
		<img src={resolve('/chest_open.png')} alt="Closed Open" class="size-80" />
	{:else}
		<img src={resolve('/chest_closed.png')} alt="Closed Chest" class="size-80" />
		<Button label="Open Chest" onclick={openChest} icon={Ticket} />
	{/if}
</div>

<style>
	.fade-out-wrapper {
		animation: smoothFadeOut 2s ease-in forwards;
	}

	@keyframes smoothFadeOut {
		0% {
			opacity: 1;
		}
		60% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
