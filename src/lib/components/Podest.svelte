<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Card from './Card.svelte';
	import { Medal } from '@lucide/svelte';
	import { gameData } from '$lib/gameStore.svelte';

	type Props = {
		playerName: string;
		score: number;
		placement: 1 | 2 | 3;
		numCorrectAnswers: number;
		class?: ClassValue;
		style?: string;
	};

	let {
		playerName,
		score,
		placement,
		numCorrectAnswers,
		class: classes,
		style,
		...others
	}: Props = $props();
</script>

<Card
	{style}
	elevation={placement === 1 ? 'high' : placement === 2 ? 'medium' : 'low'}
	class={[
		'flex w-full flex-row border-t-8 md:flex-col',
		placement === 1 && 'min-h-1/3 border-t-gold md:h-full',
		placement === 2 && 'min-h-1/3 border-t-silver md:min-h-2/3',
		placement === 3 && 'min-h-1/3 border-t-bronze',
		classes,
	]}
	{...others}>
	<div
		class="flex w-full flex-col items-center justify-center gap-2 text-center text-2xl font-bold text-nowrap">
		<span>
			<Medal
				size={64 / placement}
				class={[
					placement === 1 && 'text-gold',
					placement === 2 && 'text-silver',
					placement === 3 && 'text-bronze',
				]} />
		</span>
		{playerName}
	</div>

	<div class="invisible mt-2 flex w-full justify-center font-bold text-text-muted md:visible">
		{numCorrectAnswers}/{gameData.state.numRounds}
	</div>

	<div
		class={[
			'mt-auto flex w-full items-end justify-center py-2 text-6xl font-bold',
			placement === 1 && 'text-gold',
			placement === 2 && 'text-silver',
			placement === 3 && 'text-bronze',
		]}>
		{score}
	</div>
</Card>
