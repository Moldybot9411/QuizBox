<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		value: number;
		class?: ClassValue;
		color?: 'primary' | 'info' | 'error' | 'warning' | 'success';
	};

	let { color = 'primary', value = 0, class: classes }: Props = $props();
</script>

<div class={['highlight w-full overflow-hidden rounded-full bg-surface-light p-1', classes]}>
	<div class="elevation-inset min-h-3 w-full overflow-hidden rounded-full bg-surface">
		<div
			class={[
				'h-full min-h-3 rounded-full',
				color === 'primary' && 'bg-primary',
				color === 'info' && 'bg-surface-info',
				color === 'warning' && 'bg-surface-warning',
				color === 'error' && 'bg-surface-error',
				color === 'success' && 'bg-surface-success',
			]}
			style="width: {value}%;">
		</div>
	</div>
</div>
