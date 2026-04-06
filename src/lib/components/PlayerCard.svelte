<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Card from './Card.svelte';
	import { changeName, gameData } from '$lib/gameStore.svelte';
	import { Check, Crown, Pen, User, X } from '@lucide/svelte';
	import { error } from '@sveltejs/kit';
	import { addToast } from './Toast.svelte';

	type Props = {
		name: string;
		id: string;
		class?: ClassValue;
		style?: string;
	};

	let { name, id, class: classes, style, ...others }: Props = $props();

	let isEditing = $state(false);
	let inputFieldRef: HTMLInputElement | null = $state(null);

	function checkUsername(name: string): boolean {
		if (!name.trim()) {
			addToast({
				message: 'Username cannot be empty.',
				type: 'error',
			});
			return false;
		}

		if (name.trim().length > 20) {
			addToast({
				message: 'Username cannot be longer than 20 characters.',
				type: 'error',
			});
			return false;
		}

		const nameExists = gameData.state.players.some((p) => p.name.trim() === name.trim());
		if (nameExists) {
			addToast({
				message: 'Username already exists. Please choose another one.',
				type: 'error',
			});
			return false;
		}

		addToast({
			message: 'Username updated successfully.',
			type: 'success',
		});

		return true;
	}
</script>

<Card
	elevation="inset"
	title={id === gameData.socket?.id ? 'This is you' : undefined}
	class="flex flex-1 basis-sm items-center gap-2 text-xl font-bold">
	{#if id === gameData.state.adminId}
		<Crown color="orange" />
	{/if}

	{#if isEditing}
		<input
			aria-label="Enter new Username"
			class="outline-2"
			bind:this={inputFieldRef}
			type="text"
			value={name}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					inputFieldRef!.value = name;
					isEditing = false;
				}

				if (e.key === 'Enter') {
					if (!checkUsername(inputFieldRef?.value || name)) {
						return;
					}

					changeName(inputFieldRef?.value || name);
					isEditing = false;
				}
			}} />
	{:else}
		{name}
	{/if}

	{#if id === gameData.socket?.id}
		<span class="ml-auto flex items-center gap-2">
			{#if isEditing}
				<button
					onclick={() => {
						inputFieldRef!.value = name;
						isEditing = false;
					}}
					aria-label="Edit Username"
					class="cursor-pointer rounded-md border border-gray-300 bg-gray-200 p-2 hover:bg-gray-300">
					<X size={16} />
				</button>
			{/if}
			<button
				onclick={() => {
					isEditing = !isEditing;

					if (isEditing) {
						setTimeout(() => {
							inputFieldRef?.focus();
						}, 0);
						return;
					}

					if (!isEditing) {
						if (!checkUsername(inputFieldRef?.value || name)) {
							isEditing = true;
							return;
						}

						changeName(inputFieldRef?.value || name);
					}
				}}
				aria-label="Edit Username"
				class="cursor-pointer rounded-md border border-gray-300 bg-gray-200 p-2 hover:bg-gray-300">
				{#if isEditing}
					<Check size={16} />
				{:else}
					<Pen size={16} />
				{/if}
			</button>
			<User />
		</span>
	{/if}
</Card>
