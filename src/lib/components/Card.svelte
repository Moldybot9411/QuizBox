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
		'rounded-md border border-border bg-surface p-4 text-text',
		elevation === 'low' && 'elevation-low highlight',
		elevation === 'medium' && 'elevation-medium highlight',
		elevation === 'high' && 'elevation-high highlight',
		elevation === 'inset' && 'elevation-inset bg-surface-light',
		classes,
	]}
	{style}
	{title}
	{...others}>
	{@render children?.()}
</div>
