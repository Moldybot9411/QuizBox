import { HatGlasses, Shield, Timer, type LucideIcon } from '@lucide/svelte';
import { ItemType as ItemTypeEnum, type ItemType } from './schema';

export type PowerupItem = {
	type: ItemType;
	title: string;
	description: string;
	icon: LucideIcon;
	color: string;
};

export const PowerupItems: PowerupItem[] = [
	{
		type: ItemTypeEnum.DOUBLETIMER,
		title: '2x Timer',
		description: 'Make the time of a player of your choice go by twice as fast',
		icon: Timer,
		color: 'lightgreen',
	},
	{
		type: ItemTypeEnum.STEALPOINTS,
		title: 'Steal Points',
		description: 'Steal a percentage of points from the best performing player',
		icon: HatGlasses,
		color: 'hotpink',
	},
	{
		type: ItemTypeEnum.SHIELD,
		title: 'Shield',
		description: 'Protect yourself from the next attack',
		icon: Shield,
		color: 'turquoise',
	},
];
