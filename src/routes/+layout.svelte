<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onNavigate } from '$app/navigation';
	import { gameData } from '$lib/gameStore.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Moon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onNavigate(() => {
		gameData.socket?.close();
	});

	onMount(() => {
		const currentTheme = localStorage.getItem('theme');

		if (!currentTheme) {
			localStorage.setItem('theme', 'light');
			return;
		}

		if (currentTheme === 'dark') {
			document.documentElement.classList.add('dark');
			return;
		}

		document.documentElement.classList.remove('dark');
	});

	function toggleDarkMode() {
		document.documentElement.classList.toggle('dark');

		if (document.documentElement.classList.contains('dark')) {
			localStorage.setItem('theme', 'dark');
			return;
		}

		localStorage.setItem('theme', 'light');
	}
</script>

<Button
	aria-label="Toggle Light/Dark Mode"
	variant="secondary"
	class="fixed top-4 right-4 p-3!"
	onclick={toggleDarkMode}>
	<Moon />
</Button>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<Toast />
