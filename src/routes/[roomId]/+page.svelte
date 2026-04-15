<script lang="ts">
	import Evaluation from '$lib/components/Evaluation.svelte';
	import Lobby from '$lib/components/Lobby.svelte';
	import Playing from '$lib/components/Playing.svelte';
	import PostGame from '$lib/components/PostGame.svelte';
	import { gameData, initGame } from '$lib/gameStore.svelte';
	import { State } from '$lib/shared/schema.js';
	import { onMount } from 'svelte';

	let { params } = $props();

	onMount(() => {
		initGame(params.roomId, () => {});
	});
</script>

{#if gameData.state.state === State.LOBBY}
	<Lobby roomId={params.roomId} />
{:else if gameData.state.state === State.PLAYING}
	<Playing />
{:else if gameData.state.state === State.EVALUATION}
	<Evaluation />
{:else if gameData.state.state === State.POSTGAME}
	<PostGame />
{/if}
