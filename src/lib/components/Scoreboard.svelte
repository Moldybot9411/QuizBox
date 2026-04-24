<script lang="ts">
	import { gameData } from '$lib/gameStore.svelte';
	import type { ClassValue } from 'svelte/elements';
	import ProgressBar from './ProgressBar.svelte';

	type Props = {
		scoreData: {
			id: string;
			name: string;
			totalScore: number;
			numCorrectAnswers: number;
		}[];
		startPlacementAt?: number;
		showGauges?: boolean;
		class?: ClassValue;
		style?: string;
	};

	let {
		scoreData = [],
		startPlacementAt = 1,
		showGauges = true,
		class: classes,
		style,
		...others
	}: Props = $props();
</script>

<div class={['overflow-hidden rounded-md border border-border', classes]} {style} {...others}>
	<table class="w-full min-w-max table-auto rounded-md text-left">
		<thead>
			<tr class="border-b border-border bg-surface">
				<th class="p-2"></th>
				<th class="p-2">Name</th>
				<th class="p-2">Score</th>
				{#if showGauges}
					<th class="p-2">Correct Answers</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each scoreData as player, index}
				{@const percentage = player.numCorrectAnswers
					? (player.numCorrectAnswers / gameData.state.numRounds) * 100
					: 0}
				<tr
					class={[
						'border-b border-border bg-surface-light text-text-muted last:border-b-0',
						player.id === gameData.socket?.id && 'bg-surface-dark! font-bold text-text!',
					]}>
					<td class="p-2">
						{index + startPlacementAt}.
					</td>
					<td class="p-2">
						{player.name}
					</td>
					<td class="p-2">
						{player.totalScore}
					</td>
					{#if showGauges}
						<td class="p-2">
							<ProgressBar
								color={percentage >= 50 ? 'success' : percentage > 20 ? 'warning' : 'error'}
								value={percentage} />
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
