<script lang="ts">
	import type { LucideIcon } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
		elevation?: 'inset' | 'none' | 'low' | 'medium' | 'high';
		variant?: 'primary' | 'secondary' | 'tertiary';
		label?: string;
		icon?: LucideIcon;
	}

	let {
		children,
		elevation = 'none',
		variant = 'primary',
		label,
		disabled,
		icon: IconComponent,
		class: classes,
		...others
	}: Props = $props();
</script>

<button
	{...others}
	{disabled}
	class={[
		'flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 font-bold disabled:pointer-events-none disabled:cursor-default disabled:opacity-50',
		elevation === 'inset' && 'elevation-inset',
		elevation === 'none' && 'highlight',
		elevation === 'low' && 'elevation-low highlight',
		elevation === 'medium' && 'elevation-medium highlight',
		elevation === 'high' && 'elevation-high highlight',
		variant === 'primary' && 'bg-primary text-text hover:bg-primary-hover',
		variant === 'secondary' &&
			'border border-border bg-secondary p-2 text-text hover:bg-secondary-hover',
		variant === 'tertiary' &&
			'border border-border bg-transparent text-text hover:bg-secondary-hover',
		!label && IconComponent && 'p-2!',
		classes,
	]}>
	{#if children}
		{@render children()}
	{:else}
		{#if IconComponent}
			<IconComponent size={16} />
		{/if}
		{#if label}
			{label}
		{/if}
	{/if}
</button>
