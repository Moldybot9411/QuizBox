<script>
	import { ChevronDown, ChevronUp } from '@lucide/svelte';
	import ItemSelectionArea from './ItemSelectionArea.svelte';
	import { ItemType } from '$lib/shared/schema';

	let isOpen = $state(false);
</script>

<div class="absolute bottom-0 left-0 flex w-full flex-col items-center">
	<button
		onclick={() => (isOpen = !isOpen)}
		class="z-1 flex h-12 w-32 cursor-pointer
        flex-col items-center justify-center rounded-t-lg border border-b-0
        border-gray-300 bg-gray-200 shadow-[0_-4px_10px_1px_rgba(0,0,0,0.1)]
        hover:bg-gray-300">
		{#if isOpen}
			<ChevronDown size={32} />
		{:else}
			<ChevronUp size={32} />
		{/if}
	</button>

	{#if isOpen}
		<div
			class="flex w-full items-center justify-center rounded-t-xl border border-gray-300 bg-gray-100 shadow-[0_-4px_10px_1px_rgba(0,0,0,0.1)]">
			<ItemSelectionArea
				items={[
					ItemType.DOUBLETIMER,
					ItemType.SHIELD,
					ItemType.STEALPOINTS,
					ItemType.DOUBLETIMER,
				]} />
		</div>
	{/if}
</div>
