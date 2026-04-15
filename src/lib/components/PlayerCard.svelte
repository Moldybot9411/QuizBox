<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Card from './Card.svelte';
	import { changeName, gameData } from '$lib/gameStore.svelte';
	import { Check, Crown, Pen, User, X } from '@lucide/svelte';
	import { addToast } from './Toast.svelte';
	import Button from './Button.svelte';

	type Props = {
		name: string;
		id: string;
		class?: ClassValue;
		style?: string;
	};

	let { name, id, class: classes, style }: Props = $props();

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
	class={['flex min-h-17 flex-1 basis-sm items-center gap-2 text-xl font-bold', classes]}
	{style}>
	{#if id === gameData.state.adminId}
		<Crown color="orange" class="min-w-6" />
	{/if}

	{#if isEditing}
		<input
			aria-label="Enter new Username"
			class="elevation-inset w-full rounded-md border border-gray-300 px-4 py-0.5 outline-none"
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
				<Button
					onclick={() => {
						inputFieldRef!.value = name;
						isEditing = false;
					}}
					aria-label="Edit Username"
					variant="tertiary"
					icon={X} />
			{/if}
			<Button
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
				variant={isEditing ? 'primary' : 'tertiary'}
				icon={isEditing ? Check : Pen} />
			<User />
		</span>
	{/if}
</Card>
