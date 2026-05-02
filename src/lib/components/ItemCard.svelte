<script lang="ts">
	import type { LucideIcon } from '@lucide/svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		color?: 'primary' | 'info' | 'error' | 'warning' | 'success';
		name: string;
		icon: LucideIcon;
		class?: ClassValue;
	};

	let { color = 'info', name, icon: IconComponent, class: classes, ...others }: Props = $props();
</script>

<div
	class={[
		'card-wrapper elevation-high flex min-h-50 w-35 flex-col items-center justify-center gap-8 rounded-lg border-3 bg-surface-light p-2',
		color === 'primary' && 'border-primary text-primary',
		color === 'info' && 'border-surface-info text-surface-info',
		color === 'error' && 'border-surface-error text-surface-error',
		color === 'warning' && 'border-surface-warning text-surface-warning',
		color === 'success' && 'border-surface-success text-surface-success',
	]}
	{...others}>
	<span class="text-2xl font-bold">{name}</span>
	<IconComponent size={50} />
</div>

<style>
	@keyframes card-rotation {
		0% {
			transform: rotateY(-20deg) rotateX(5deg);
			filter: hue-rotate(0deg);
		}
		50% {
			filter: brightness(150%);
			filter: hue-rotate(40deg);
		}
		100% {
			transform: rotateY(20deg) rotateX(-5deg);
			filter: hue-rotate(0deg);
		}
	}

	.card-wrapper {
		animation: 3s infinite card-rotation ease-in-out;
	}
</style>
