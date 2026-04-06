<script lang="ts">
	import { PowerupItems, type PowerupItem } from '$lib/shared/items';
	import { ItemType } from '$lib/shared/schema';
	import { Ban, Icon } from '@lucide/svelte';

	type Props = {
		/**
		 * The Items which the player is currently holding.
		 */
		items?: ItemType[];
		/**
		 * Maximum angle in degress in which the cards will be spead. Defaults to 50
		 */
		maxSpread?: number;
		/**
		 * Maximum number of items a hand can hold. Defaults to 5
		 */
		maxItems?: number;
	};

	let { items = [], maxSpread = 50, maxItems = 5 }: Props = $props();

	const middleIndex = $derived((items.length - 1) / 2);
	const angleStep = $derived(items.length > 1 ? maxSpread / (items.length - 1) : 0);
	const fullItems: PowerupItem[] = $derived(
		items.map((type) => {
			return (
				PowerupItems.find((item) => item.type === type) || {
					title: 'Unknown Item',
					description: 'No description available',
					type: ItemType.DOUBLETIMER,
					icon: Ban,
					color: 'black',
				}
			);
		})
	);

	let description = $state('');
</script>

<div class="relative flex h-75 items-end justify-center">
	{#each fullItems as item, i}
		{@const angle = (i - middleIndex) * angleStep}

		<div
			role="button"
			tabindex="0"
			onmouseenter={() => {
				description = item.description;
			}}
			onfocus={() => {
				description = item.description;
			}}
			onmouseleave={() => {
				description = '';
			}}
			onfocusout={() => {
				description = '';
			}}
			class="
			absolute bottom-30 flex h-37.5
			w-25 origin-[50%_250%] cursor-pointer flex-col items-center gap-4
			rounded-lg border border-gray-300 p-2 text-center text-lg font-bold
			text-gray-900 shadow-md backdrop-blur-xs transition-all
			duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] select-none
			focus-within:z-1 focus-within:[--s:1.02] focus-within:[--ty:-10px] hover:z-1 hover:shadow-2xl hover:[--s:1.02] hover:[--ty:-10px]
		  "
			style="transform: rotate({angle}deg) translateY(var(--ty, 0px)) scale(var(--s, 1)); background-color: color-mix(in srgb, {item.color} 40%, transparent);">
			<item.icon size={42} />
			{item.title}
		</div>
	{/each}
	<div class="text-center text-gray-700">
		<p>{items.length}/{maxItems}</p>
		{description}
	</div>
</div>
