<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	type Props = {
		children?: Snippet;
		elevation?: 'none' | 'low' | 'medium' | 'high' | 'inset';
		title?: string;
		class?: ClassValue;
		style?: string;
	};

	let { children, elevation = 'none', title, class: classes, style, ...others }: Props = $props();
</script>

<div
	class={[
		'rounded-md border border-gray-300 bg-gray-100 p-4 text-gray-800 inset-shadow-xs inset-shadow-white',
		elevation === 'low' && 'shadow-sm',
		elevation === 'medium' && 'shadow-md',
		elevation === 'high' && 'shadow-lg',
		elevation === 'inset' && 'bg-white! inset-shadow-gray-400!',
		classes,
	]}
	{style}
	{title}
	{...others}>
	{@render children?.()}
</div>
