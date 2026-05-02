<script lang="ts">
	import { confetti } from '@neoconfetti/svelte';
	import { resolve } from '$app/paths';
	import Button from './Button.svelte';
	import { CircleOff, MoveRight, Ticket } from '@lucide/svelte';
	import ItemCard from './ItemCard.svelte';
	import { gameData, sendOpenChest, sendPullStateContinue } from '$lib/gameStore.svelte';
	import { ItemCosmeticData } from '$lib/itemIcons';
	import { Items } from '$lib/shared/items';
	import Card from './Card.svelte';
	import InventoryDrawer from './InventoryDrawer.svelte';

	const confettiDuration = 2000;

	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let confettiVisible = $state(false);
	let chestOpen = $state(false);
	let inventoryFull = $derived(gameData.itemPullData.yourItem === undefined);

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
	<!-- Not using 'inventoryFull' here because of type checking -->
	{#if chestOpen && gameData.itemPullData.yourItem !== undefined}
		<ItemCard
			name={Items[gameData.itemPullData.yourItem].title}
			icon={ItemCosmeticData[gameData.itemPullData.yourItem].icon}
			color={ItemCosmeticData[gameData.itemPullData.yourItem].color} />
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
		{#if inventoryFull}
			<Card elevation="high" class="bg-surface-error text-2xl font-bold">Inventory Full</Card>
		{/if}
		<div class="relative size-80">
			<img
				src={resolve('/chest_closed.png')}
				alt="Closed Chest"
				class="absolute top-0 left-0 size-80" />
			{#if inventoryFull}
				<CircleOff class="absolute top-22 left-15 size-50 text-surface-error" />
			{/if}
		</div>
		{#if !inventoryFull}
			<Button label="Open Chest" variant="secondary" onclick={openChest} icon={Ticket} />
		{/if}
	{/if}
</div>

<div class="fixed right-4 bottom-4 flex flex-col gap-2">
	<Card elevation="low" class="py-2!">
		<span class="font-bold"
			>{gameData.itemPullData.readyPlayers.length}/{gameData.state.playerCount}</span>
		Players Ready
	</Card>
	{#if gameData.isAdmin}
		<Button
			label="Continue"
			icon={MoveRight}
			disabled={gameData.itemPullData.readyPlayers.length < gameData.state.playerCount}
			onclick={sendPullStateContinue} />
	{/if}
</div>

{#if chestOpen || inventoryFull}
	<InventoryDrawer />
{/if}

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
