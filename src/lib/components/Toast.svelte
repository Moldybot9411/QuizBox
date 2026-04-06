<script module lang="ts">
	import { CircleCheck, CircleX, Info, X } from '@lucide/svelte';
	import { nanoid } from 'nanoid';
	import { fly, slide } from 'svelte/transition';

	export type ToastMessage = {
		id: string;
		message: string;
		type: 'success' | 'error' | 'info';
	};

	let toasts: ToastMessage[] = $state([]);

	export function addToast(message: Omit<ToastMessage, 'id'>) {
		const id = nanoid();
		toasts.push({ ...message, id });

		setTimeout(() => {
			toasts = toasts.filter((t) => t.id !== id);
		}, 3000);
	}
</script>

<div class="fixed right-4 bottom-4 flex max-w-92 transform flex-col gap-2">
	{#each toasts as toast (toast.id)}
		<div
			transition:slide
			class={[
				'flex items-center justify-center gap-4 rounded-md p-4 text-balance text-gray-800 shadow-lg transition-all',
				toast.type === 'success' && 'bg-green-200',
				toast.type === 'error' && 'bg-red-200',
				toast.type === 'info' && 'bg-blue-200',
			]}>
			<div class="self-start p-2">
				{#if toast.type === 'success'}
					<CircleCheck size={24} />
				{:else if toast.type === 'error'}
					<CircleX size={24} />
				{:else if toast.type === 'info'}
					<Info size={24} />
				{/if}
			</div>

			{toast.message}

			<button
				aria-label="Close Toast Message"
				onclick={() => (toasts = toasts.filter((el) => el.id !== toast.id))}
				class={[
					'cursor-pointer self-start rounded-md border p-2',
					toast.type === 'success' && 'border-green-700 bg-green-300 hover:bg-green-400',
					toast.type === 'error' && 'border-red-700 bg-red-300 hover:bg-red-400',
					toast.type === 'info' && 'border-blue-700 bg-blue-300 hover:bg-blue-400',
				]}>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>
