<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_PARTYKIT_HOST } from '$env/static/public';
	import { doesRoomExist } from '$lib/gameStore.svelte';

	let errorMessage = $state('');

	$effect(() => {
		if (errorMessage) {
			setTimeout(() => {
				errorMessage = '';
			}, 2000);
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget as HTMLFormElement);

		const data = Object.fromEntries(formData.entries());

		const roomCode = data['roomCode'] as string;
		const roomExists = await doesRoomExist(roomCode);
		if (roomExists) {
			goto(`/${roomCode}`);
			return;
		}

		errorMessage = "This room doesn't exist";
	}

	async function createRoom() {
		const resp = await fetch(`${PUBLIC_PARTYKIT_HOST}/parties/api/createRoom`, { method: 'POST' });

		if (resp.ok) {
			const newId = await resp.text();

			goto(`/${newId}`);
			return;
		}

		errorMessage = "Error: New room couldn't be created";
	}
</script>

<h1 class="mb-4 text-2xl font-extrabold">Welcome</h1>

<form onsubmit={handleSubmit} class="mb-4 flex w-fit flex-col gap-4 rounded-md bg-gray-200 p-4">
	<label class="flex flex-col gap-1">
		Enter room code
		<input name="roomCode" type="text" class="bg-gray-100 px-4 py-2" />
	</label>
	<button
		type="submit"
		class="cursor-pointer rounded-md bg-indigo-400 px-4 py-2 font-bold text-white hover:bg-indigo-500">
		Join
	</button>
	{#if errorMessage}
		<span class="wrap-anywhere text-red-500">{errorMessage}</span>
	{/if}
</form>

<button
	class="cursor-pointer rounded-md bg-indigo-400 px-4 py-2 font-bold text-white hover:bg-indigo-500"
	onclick={createRoom}>
	+ Create
</button>
