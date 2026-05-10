<script lang="ts">
	import { sendItemChooseContinue } from '$lib/gameStore.svelte';
	import Button from './Button.svelte';
</script>

<h1>Item Choose State</h1>

<Button label="Continue" onclick={sendItemChooseContinue} />
