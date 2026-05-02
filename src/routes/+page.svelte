<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { PUBLIC_PARTYKIT_HOST } from '$env/static/public';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import { doesRoomExist } from '$lib/gameStore.svelte';
	import { CirclePlus } from '@lucide/svelte';

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
			goto(`${roomCode}`);
			return;
		}

		errorMessage = "This room doesn't exist";
	}

	async function createRoom() {
		const resp = await fetch(`${PUBLIC_PARTYKIT_HOST}/parties/api/createRoom`, { method: 'POST' });

		if (resp.ok) {
			const newId = await resp.text();

			goto(`${newId}`);
			return;
		}

		errorMessage = "Error: New room couldn't be created";
	}
</script>

<div class="flex min-h-[calc(100dvh-2rem)] w-full flex-col items-center justify-center gap-8">
	<div class="flex flex-col flex-nowrap items-center gap-1">
		<img src={resolve('/QuizBox.svg')} alt="QuizBox Logo Logo" class="w-20" />
		<h1 class="flex flex-col text-center font-bold">
			<span class="text-5xl">Quiz</span>
			<span class="text-4xl tracking-widest text-text-muted">BOX</span>
		</h1>
	</div>

	<Card elevation="low">
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<label class="flex flex-col gap-1">
				<span class="font-bold"> Enter room code </span>
				<input
					name="roomCode"
					type="text"
					class="elevation-inset rounded-md bg-surface-light px-4 py-2 text-text-muted" />
			</label>
			<Button label="Join" type="submit" />
			{#if errorMessage}
				<span class="wrap-anywhere text-red-500">{errorMessage}</span>
			{/if}
		</form>
	</Card>

	<Button onclick={createRoom} icon={CirclePlus} label="Create" elevation="low" />
</div>
