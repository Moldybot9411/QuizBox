<script>
	import { backToLobby, gameData, increaseCounter, reset } from '$lib/gameStore.svelte';
</script>

<div class="mb-8 flex w-fit flex-col gap-2 rounded-md bg-gray-200 p-4">
	<p>
		Question {gameData.state.currentRound + 1}/{gameData.state.numRounds}: {gameData.state.question}
	</p>
</div>

{#each gameData.state.options as option, index}
	<div
		class="mb-4 flex w-full cursor-pointer items-center gap-4 rounded-md bg-gray-200 p-4 hover:bg-gray-300">
		<p>{option}</p>
	</div>
{/each}

{#if gameData.isAdmin}
	<button
		onclick={backToLobby}
		class="mb-4 cursor-pointer rounded-md bg-indigo-400 px-4 py-2 text-white hover:bg-indigo-500"
		>Back to Lobby</button>
{/if}
