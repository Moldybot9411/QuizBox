<script>
	import { backToLobby, gameData, nextRound } from '$lib/gameStore.svelte';
	import Button from './Button.svelte';
</script>

<h1 class="text-2xl font-bold">Evaluation Phase</h1>
<div>
	Your result: {gameData.roundResult?.result}
</div>
<div>
	Your score: {gameData.roundResult?.score}
</div>
<div>
	You answered in {(gameData.roundResult?.timeDelta ?? 0) / 1000}s!
</div>

{#if gameData.isAdmin}
	<Button label="Next Round" onclick={nextRound} />
	<Button label="Back to Lobby" variant="secondary" onclick={backToLobby} />
{/if}
