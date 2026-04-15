import { goto } from '$app/navigation';
import { doesRoomExist } from '$lib/gameStore.svelte';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const roomId = params.roomId;

	const roomExists = await doesRoomExist(roomId);

	if (!roomExists) {
		goto('/');
	}
};

export const prerender = false;
