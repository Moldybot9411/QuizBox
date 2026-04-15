<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		value: number;
		class?: ClassValue;
	};

	let { value = 0, class: classes }: Props = $props();
</script>

<div class={['highlight w-full overflow-hidden rounded-full bg-surface-light p-1', classes]}>
	<div class="elevation-inset min-h-3 w-full rounded-full bg-surface">
		<div class="h-full min-h-3 rounded-full bg-primary" style="width: {value}%;"></div>
	</div>
</div>
