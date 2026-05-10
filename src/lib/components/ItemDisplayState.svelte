<script lang="ts">
	import { sendItemDisplayContinue } from '$lib/gameStore.svelte';
	import Button from './Button.svelte';
</script>

<h1>Item Display State</h1>

<Button label="Continue" onclick={sendItemDisplayContinue} />
