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

export type PowerupItemIcons = {
	[key in ItemType]: LucideIcon;
};

export const ItemIcons: PowerupItemIcons = {
	[ItemType.SHIELD]: Shield,
	[ItemType.SQUID]: Bubbles,
	[ItemType.SCRAMBLE]: Replace,
	[ItemType.DR_WHO]: Hourglass,
	[ItemType.MIRROR]: MirrorRound,
	[ItemType.ALL_IN]: HandCoins,
	[ItemType.FIFTY_FIFTY]: CircleSlash2,
	[ItemType.HIVEMIND]: Hexagon,
};
