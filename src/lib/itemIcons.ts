import {
	Bubbles,
	CircleSlash2,
	HandCoins,
	Hexagon,
	Hourglass,
	MirrorRound,
	Replace,
	Shield,
	type LucideIcon,
} from '@lucide/svelte';
import { ItemType } from './shared/items';

export type PowerupItemCosmetics = {
	[key in ItemType]: {
		icon: LucideIcon;
		color: 'primary' | 'info' | 'error' | 'warning' | 'success';
	};
};

export const ItemCosmeticData: PowerupItemCosmetics = {
	[ItemType.SHIELD]: {
		icon: Shield,
		color: 'info',
	},
	[ItemType.SQUID]: {
		icon: Bubbles,
		color: 'success',
	},
	[ItemType.SCRAMBLE]: {
		icon: Replace,
		color: 'success',
	},
	[ItemType.DR_WHO]: {
		icon: Hourglass,
		color: 'success',
	},
	[ItemType.MIRROR]: {
		icon: MirrorRound,
		color: 'info',
	},
	[ItemType.ALL_IN]: {
		icon: HandCoins,
		color: 'error',
	},
	[ItemType.FIFTY_FIFTY]: {
		icon: CircleSlash2,
		color: 'error',
	},
	[ItemType.HIVEMIND]: {
		icon: Hexagon,
		color: 'error',
	},
};
