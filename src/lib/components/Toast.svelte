<script module lang="ts">
	import { CircleCheck, CircleX, Info, TriangleAlert, X } from '@lucide/svelte';
	import { nanoid } from 'nanoid';
	import { fly, slide } from 'svelte/transition';

	export type ToastMessage = {
		id: string;
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
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
				'flex items-center justify-between gap-4 rounded-md p-4 text-balance text-gray-800 shadow-lg transition-all',
				toast.type === 'success' && 'bg-surface-success',
				toast.type === 'error' && 'bg-surface-error',
				toast.type === 'info' && 'bg-surface-info',
				toast.type === 'warning' && 'bg-surface-warning',
			]}>
			<div class="self-start p-2 pr-0">
				{#if toast.type === 'success'}
					<CircleCheck size={24} />
				{:else if toast.type === 'error'}
					<CircleX size={24} />
				{:else if toast.type === 'info'}
					<Info size={24} />
				{:else if toast.type === 'warning'}
					<TriangleAlert size={24} />
				{/if}
			</div>

			{toast.message}

			<button
				aria-label="Close Toast Message"
				onclick={() => (toasts = toasts.filter((el) => el.id !== toast.id))}
				class={['mt-1 cursor-pointer self-start rounded-md border p-2']}>
				<X size={16} />
			</button>
		</div>
	{/each}
</div>
