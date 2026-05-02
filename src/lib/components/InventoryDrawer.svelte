<script lang="ts">
	import { ItemCosmeticData } from '$lib/itemIcons';
	import { MAX_ITEMS } from '$lib/shared/gameSettings';
	import { Items, ItemType } from '$lib/shared/items';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import { slide } from 'svelte/transition';
	import Button from './Button.svelte';
	import { tooltip } from 'svooltip';
	import 'svooltip/styles.css';
	import { gameData } from '$lib/gameStore.svelte';

	let isOpen = $state(false);
</script>

{#snippet item(item?: ItemType)}
	{@const Icon = item !== undefined ? ItemCosmeticData[item].icon : undefined}
	{@const color = item !== undefined ? ItemCosmeticData[item].color : undefined}

	<button
		title={item !== undefined ? Items[item].description : 'No Item'}
		use:tooltip={{
			offset: 8,
		}}
		class="rounded-md border-3 border-dashed border-border p-2 hover:bg-surface-light focus:bg-surface-light md:p-4">
		{#if Icon}
			<Icon class="text-surface-{color}" size={64} />
		{:else}
			<div class="size-16"></div>
		{/if}
	</button>
{/snippet}

<div
	class="pointer-events-none absolute bottom-0 left-0 flex w-full flex-col items-start md:items-center">
	<Button
		aria-label={isOpen ? 'Close Inventory' : 'Open Inventory'}
		class="pointer-events-auto ml-4 h-12 w-32 rounded-b-none! border-b-0! bg-surface-light! hover:bg-surface!"
		onclick={() => (isOpen = !isOpen)}>
		{#if isOpen}
			<ChevronDown size={24} />
		{:else}
			<ChevronUp size={24} />
		{/if}
	</Button>

	{#if isOpen}
		<div
			transition:slide
			class="elevation-low highlight pointer-events-auto flex w-full items-center justify-center gap-4 rounded-t-xl border border-border bg-surface p-4 md:w-fit md:p-8">
			{#each Array.from({ length: MAX_ITEMS }) as _, index}
				{@render item(gameData.itemPullData.inventory[index]?.itemType)}
			{/each}
		</div>
	{/if}
</div>

<style>
	:root {
		--svooltip-bg: var(--color-surface-light);
		--svooltip-text: var(--color-text);
		--svooltip-arrow-size: 0px;
		--svooltip-padding: 1rem;
		--svooltip-text-size: 16px;
	}
</style>
