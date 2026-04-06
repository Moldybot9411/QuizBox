<script lang="ts">
	import { backToLobby, gameData } from '$lib/gameStore.svelte';
</script>

<img
	src="https://ih1.redbubble.net/image.511602848.1011/bg,f8f8f8-flat,750x,075,f-pad,750x1000,f8f8f8.u1.webp"
	alt="Your did it"
	class="h-128" />

{#if gameData.isAdmin}
	<button
		onclick={backToLobby}
		class="mb-4 cursor-pointer rounded-md bg-indigo-400 px-4 py-2 text-white hover:bg-indigo-500"
		>Back to Lobby</button>
{:else}
	<div>Waiting for admin to return to lobby...</div>
{/if}
