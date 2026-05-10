<script lang="ts">
	import EvaluationState from '$lib/components/EvaluationState.svelte';
	import ItemChooseState from '$lib/components/ItemChooseState.svelte';
	import ItemDisplayState from '$lib/components/ItemDisplayState.svelte';
	import ItemPullState from '$lib/components/ItemPullState.svelte';
	import LobbyState from '$lib/components/LobbyState.svelte';
	import PlayingState from '$lib/components/PlayingState.svelte';
	import PostGameState from '$lib/components/PostGameState.svelte';
	import { gameData, initGame } from '$lib/gameStore.svelte';
	import { State } from '$lib/shared/schema.js';
	import { onMount } from 'svelte';

	let { params } = $props();

	onMount(() => {
		initGame(params.roomId, () => {});
	});
</script>

<svelte:head>
	<title>Room {params.roomId} | QuizBox</title>
</svelte:head>

{#if gameData.state.state === State.LOBBY}
	<LobbyState roomId={params.roomId} />
{:else if gameData.state.state === State.ITEM_PULL}
	<ItemPullState />
{:else if gameData.state.state === State.ITEM_CHOOSE}
	<ItemChooseState />
{:else if gameData.state.state === State.ITEM_DISPLAY}
	<ItemDisplayState />
{:else if gameData.state.state === State.PLAYING}
	<PlayingState />
{:else if gameData.state.state === State.EVALUATION}
	<EvaluationState />
{:else if gameData.state.state === State.POSTGAME}
	<PostGameState />
{/if}
