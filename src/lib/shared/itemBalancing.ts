import { ItemType } from './items';

export const ItemBalancing = {
	thresholds: {
		top: 0.3,
		bottom: 0.7,
	},
	lootTables: {
		top: {
			[ItemType.SHIELD]: 50,
			[ItemType.MIRROR]: 30,
			[ItemType.FIFTY_FIFTY]: 20,
			[ItemType.SQUID]: 0,
			[ItemType.SCRAMBLE]: 0,
			[ItemType.DR_WHO]: 0,
			[ItemType.ALL_IN]: 0,
			[ItemType.HIVEMIND]: 0,
		},
		mid: {
			[ItemType.SQUID]: 30,
			[ItemType.SCRAMBLE]: 30,
			[ItemType.FIFTY_FIFTY]: 20,
			[ItemType.SHIELD]: 10,
			[ItemType.MIRROR]: 0,
			[ItemType.DR_WHO]: 0,
			[ItemType.ALL_IN]: 10,
			[ItemType.HIVEMIND]: 0,
		},
		bottom: {
			[ItemType.ALL_IN]: 30,
			[ItemType.DR_WHO]: 30,
			[ItemType.HIVEMIND]: 20,
			[ItemType.FIFTY_FIFTY]: 20,
			[ItemType.SQUID]: 0,
			[ItemType.SCRAMBLE]: 0,
			[ItemType.SHIELD]: 0,
			[ItemType.MIRROR]: 0,
		},
	},
};
