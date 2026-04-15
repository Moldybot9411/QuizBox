<script lang="ts">
	import { gameData, startGame } from '$lib/gameStore.svelte';
	import { onMount } from 'svelte';
	import Card from './Card.svelte';
	import { TriviaSchema, type TriviaData } from '$lib/shared/schema';
	import { CircleAlert, Clipboard, Link, LoaderCircle, User } from '@lucide/svelte';
	import PlayerCard from './PlayerCard.svelte';
	import { addToast } from './Toast.svelte';
	import Button from './Button.svelte';

	type Props = {
		roomId: string;
	};

	let { roomId }: Props = $props();

	const maxRounds = 25;

	let categories: { id: number; name: string }[] = $state([]);
	let numRounds = $state(10);
	let category = $state('any');
	let difficulty = $state('any');
	let questionType = $state('any');

	let triviaData: TriviaData | undefined = $state(undefined);

	let isLoading = $state(false);

	$inspect(triviaData);

	$effect(() => {
		if (numRounds > maxRounds) {
			numRounds = maxRounds;
		}
	});

	const opentdbUrl = $derived.by(() => {
		const params = new URLSearchParams();

		params.append('amount', numRounds && numRounds > 0 ? numRounds.toString() : String(10));

		if (category !== 'any') {
			params.append('category', category);
		}

		if (difficulty !== 'any') {
			params.append('difficulty', difficulty);
		}

		if (questionType !== 'any') {
			params.append('type', questionType);
		}

		return `https://opentdb.com/api.php?${params.toString()}`;
	});

	onMount(async () => {
		const resp = await fetch('https://opentdb.com/api_category.php');

		if (!resp.ok) {
			console.error('Failed to fetch categories');
			return;
		}

		const data = await resp.json();
		categories = data.trivia_categories;
	});

	async function loadQuestions(): Promise<TriviaData | undefined> {
		try {
			const resp = await fetch(opentdbUrl);

			if (!resp.ok) {
				addToast({
					message: 'Failed to fetch questions. Try again in a few seconds.',
					type: 'error',
				});
				return;
			}

			const rawData = await resp.json();
			const parsedData = TriviaSchema.parse(rawData);

			if (parsedData.response_code === 1) {
				addToast({
					message: "There aren't enough questions available for the selected criteria.",
					type: 'error',
				});
				return;
			}

			if (parsedData.response_code !== 0) {
				addToast({
					message:
						'There was an error retrieving the questions. Try again later or choose different criteria.',
					type: 'error',
				});
				return;
			}

			return parsedData;
		} catch (error) {
			addToast({
				message: 'Something went seriously wrong. Please contact the developer.',
				type: 'error',
			});
			console.error('Error fetching questions:', error);
		}
	}

	function copyUrl() {
		navigator.clipboard
			.writeText(window.location.href)
			.then(() => {
				addToast({
					message: 'Room URL copied to clipboard!',
					type: 'success',
				});
			})
			.catch((err) => {
				addToast({
					message: 'Failed to copy URL. Please try manually copying the address bar.',
					type: 'error',
				});
				console.error('Could not copy text: ', err);
			});
	}

	function copyCode() {
		navigator.clipboard
			.writeText(roomId)
			.then(() => {
				addToast({
					message: 'Room ID copied to clipboard!',
					type: 'success',
				});
			})
			.catch((err) => {
				addToast({
					message: 'Failed to copy Room ID. Please try manually copying the address bar.',
					type: 'error',
				});
				console.error('Could not copy text: ', err);
			});
	}
</script>

<div class="mb-2 flex items-end justify-center gap-4">
	<Card class="flex gap-4 p-2!">
		<Card elevation="inset" class="py-2! font-bold">
			{roomId}
		</Card>
		<div class="my-auto flex gap-2">
			<Button
				onclick={copyUrl}
				aria-label="Copy Room Link"
				title="Copy Room Link"
				variant="secondary"
				icon={Link} />

			<Button
				onclick={copyCode}
				aria-label="Copy Room ID"
				title="Copy Room ID"
				variant="secondary"
				icon={Clipboard} />
		</div>
	</Card>
</div>

<Card elevation="high" class="mb-4 flex flex-wrap gap-4">
	<div class="w-full">
		<Card class="flex w-fit items-center gap-2 px-3 py-1 text-sm font-bold">
			<User size={14} />
			{gameData.state.playerCount}
		</Card>
	</div>
	{#each gameData.state.players as player}
		<PlayerCard name={player.name} id={player.id} />
	{/each}
</Card>

{#if gameData.isAdmin}
	<Card class="mb-4 flex flex-col gap-6">
		<label class="flex max-w-100 flex-col gap-1">
			<span class="text-lg font-bold text-text-muted"> Number of Rounds </span>

			<input
				bind:value={numRounds}
				type="number"
				class="rounded-md border border-border bg-surface-light p-2 font-bold text-text" />
		</label>

		<label class="flex max-w-100 flex-col gap-1">
			<span class="text-lg font-bold text-text-muted"> Category </span>

			<select
				bind:value={category}
				class="rounded-md border border-border bg-surface-light p-2 font-bold text-text">
				<option value="any">Any Category</option>
				{#each categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</label>

		<label class="flex max-w-100 flex-col gap-1">
			<span class="text-lg font-bold text-text-muted"> Difficulty </span>

			<select
				bind:value={difficulty}
				class="rounded-md border border-border bg-surface-light p-2 font-bold text-text">
				<option value="any">Any Difficulty</option>
				<option value="easy">Easy</option>
				<option value="medium">Medium</option>
				<option value="hard">Hard</option>
			</select>
		</label>

		<label class="flex max-w-100 flex-col gap-1">
			<span class="text-lg font-bold text-text-muted"> Question Type </span>

			<select
				bind:value={questionType}
				class="rounded-md border border-border bg-surface-light p-2 font-bold text-text">
				<option value="any">Any Type</option>
				<option value="boolean">True / False</option>
				<option value="multiple">Multiple Choice</option>
			</select>
		</label>
	</Card>
	<div class="flex w-full flex-col items-center gap-2">
		<Button
			onclick={async () => {
				isLoading = true;
				triviaData = await loadQuestions();
				isLoading = false;

				if (triviaData) {
					startGame(triviaData);
				}
			}}
			disabled={isLoading || gameData.state.playerCount < 2}>
			{#if isLoading}
				<LoaderCircle class="animate-spin" size={24} />
			{/if}
			Start Game
		</Button>
	</div>
{:else}
	<div class="text-text-muted">Waiting for the admin to start ...</div>
{/if}

<style>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		/* display: none; <- Crashes Chrome on hover */
		-webkit-appearance: none;
		margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
	}

	input[type='number'] {
		-moz-appearance: textfield; /* Firefox */
	}
</style>
