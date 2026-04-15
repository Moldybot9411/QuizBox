<script lang="ts">
	import { onMount } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		duration?: number;
		onfinish?: () => void;
		class?: ClassValue;
	};

	let { duration = 3, onfinish = () => {}, class: classes }: Props = $props();

	let shownNumber = $derived(duration);
	let cancelKey: number | undefined;

	onMount(() => {
		shownNumber = duration;

		cancelKey = setInterval(() => {
			shownNumber--;
		}, 1000);
	});

	$effect(() => {
		if (shownNumber <= 0) {
			if (cancelKey) {
				clearInterval(cancelKey);
				onfinish();
			}
		}
	});
</script>

{#if shownNumber > 0}
	<div class={['w-full text-6xl font-bold', classes]}>
		{shownNumber}
	</div>
{/if}
