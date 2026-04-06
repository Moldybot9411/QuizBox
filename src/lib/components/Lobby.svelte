<script lang="ts">
	import { gameData, startGame } from '$lib/gameStore.svelte';
	import { onMount } from 'svelte';
	import Card from './Card.svelte';
	import { TriviaSchema, type TriviaData } from '$lib/shared/schema';
	import {
		CircleAlert,
		Clipboard,
		Cog,
		Crown,
		Link,
		LoaderCircle,
		Pen,
		PersonStanding,
		User,
	} from '@lucide/svelte';
	import PlayerCard from './PlayerCard.svelte';
	import { addToast } from './Toast.svelte';

	type Props = {
		roomId: string;
	};

	let { roomId } = $props();

	const maxRounds = 25;

	let categories: { id: number; name: string }[] = $state([]);
	let numRounds = $state(10);
	let category = $state('any');
	let difficulty = $state('any');
	let questionType = $state('any');

	let triviaData: TriviaData | undefined = $state(undefined);

	let isLoading = $state(false);
	let errorMessage = $state('');

	let timeOutCtx = 0;
	$effect(() => {
		if (errorMessage) {
			clearTimeout(timeOutCtx);

			timeOutCtx = setTimeout(() => {
				errorMessage = '';
			}, 5000);
		}
	});

	$inspect(triviaData);

	$effect(() => {
		if (numRounds > maxRounds) {
			numRounds = maxRounds;
		}
	});

	const opentdbUrl = $derived.by(() => {
		const params = new URLSearchParams();

		params.append('amount', numRounds ? numRounds.toString() : String(10));

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
				errorMessage = 'Failed to fetch questions. Try again in a few seconds.';
				return;
			}

			const rawData = await resp.json();
			const parsedData = TriviaSchema.parse(rawData);

			if (parsedData.response_code === 1) {
				errorMessage = "There aren't enough questions available for the selected criteria.";
				return;
			}

			if (parsedData.response_code !== 0) {
				errorMessage =
					'There was an error retrieving the questions. Try again later or choose different criteria.';
				return;
			}

			return parsedData;
		} catch (error) {
			errorMessage = 'Something went seriously wrong. Please contact the developer.';
			console.error('Error fetching questions:', error);
		}
	}

	function copyUrl() {
		navigator.clipboard.writeText(window.location.href);
		addToast({
			message: 'Room URL copied to clipboard!',
			type: 'success',
		});
	}

	function copyCode() {
		navigator.clipboard.writeText(roomId);
		addToast({
			message: 'Room ID copied to clipboard!',
			type: 'success',
		});
	}
</script>

<div class="mb-2 flex items-end justify-center gap-4">
	<Card class="flex gap-4 p-2!">
		<Card elevation="inset" class="py-2! font-bold">
			{roomId}
		</Card>
		<div class="my-auto flex gap-2">
			<button
				onclick={copyUrl}
				aria-label="Copy Room Link"
				title="Copy Room Link"
				class=" size-fit cursor-pointer rounded-md border border-gray-300 bg-gray-200 p-2 hover:bg-gray-300">
				<Link size={16} />
			</button>

			<button
				onclick={copyCode}
				aria-label="Copy Room ID"
				title="Copy Room ID"
				class="size-fit cursor-pointer rounded-md border border-gray-300 bg-gray-200 p-2 hover:bg-gray-300">
				<Clipboard size={16} />
			</button>
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
	<Card class="mb-4 flex flex-col gap-4">
		<label>
			Number of Rounds
			<input
				bind:value={numRounds}
				type="number"
				class="ml-2 rounded-md border border-gray-300 bg-gray-100 p-2 font-bold text-gray-900" />
		</label>

		<label>
			Category
			<select
				bind:value={category}
				class="ml-2 rounded-md border border-gray-300 bg-gray-100 p-2 font-bold text-gray-900">
				<option value="any">Any Category</option>
				{#each categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</label>

		<label>
			Difficulty
			<select
				bind:value={difficulty}
				class="ml-2 rounded-md border border-gray-300 bg-gray-100 p-2 font-bold text-gray-900">
				<option value="any">Any Difficulty</option>
				<option value="easy">Easy</option>
				<option value="medium">Medium</option>
				<option value="hard">Hard</option>
			</select>
		</label>

		<label>
			Question Type
			<select
				bind:value={questionType}
				class="ml-2 rounded-md border border-gray-300 bg-gray-100 p-2 font-bold text-gray-900">
				<option value="any">Any Type</option>
				<option value="boolean">True / False</option>
				<option value="multiple">Multiple Choice</option>
			</select>
		</label>
	</Card>
	<div class="flex w-full flex-col items-center gap-2">
		{#if errorMessage}
			<div
				class="flex gap-2 rounded-md border border-red-400 bg-red-100 px-4 py-3 text-red-700"
				role="alert">
				<CircleAlert />
				{errorMessage}
			</div>
		{/if}
		<button
			onclick={async () => {
				isLoading = true;
				triviaData = await loadQuestions();
				isLoading = false;

				if (triviaData) {
					startGame(triviaData);
				}
			}}
			disabled={isLoading || gameData.state.playerCount < 2}
			class="flex w-fit cursor-pointer items-center gap-4 rounded-md bg-indigo-400 px-4 py-2 text-xl font-bold text-white hover:bg-indigo-500 disabled:bg-indigo-300">
			{#if isLoading}
				<LoaderCircle class="animate-spin" size={24} />
			{/if}
			Start Game
		</button>
	</div>
{:else}
	<div>Waiting for the admin to start...</div>
{/if}
