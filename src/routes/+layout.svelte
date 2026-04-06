<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onNavigate } from '$app/navigation';
	import { gameData } from '$lib/gameStore.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();

	onNavigate(() => {
		gameData.socket?.close();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<Toast />
