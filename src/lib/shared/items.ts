/**
 * The Scoreboard gets divided into 3 parts: top, middle and bottom.
 *
 * - Top players get more defensive items.
 * - Middle players mostly get items to attack the top players and occasional score boosters.
 * - Bottom players mostly get score boosters and occasionally items to attack the top players.
 */

import { DOCTOR_STEAL_TIME, SCRAMBLE_INTERVAL } from './gameSettings';

export enum ItemType {
	SHIELD,
	SQUID,
	SCRAMBLE,
	DR_WHO,
	MIRROR,
	ALL_IN,
	FIFTY_FIFTY,
	HIVEMIND,
}

export type PowerupItems = {
	[key in ItemType]: {
		title: string;
		description: string;
	};
};

export const Items: PowerupItems = {
	[ItemType.SHIELD]: {
		title: 'Shield',
		description: 'Blocks one incoming attack. Breaks automatically after one round.',
	},
	[ItemType.SQUID]: {
		title: 'Squid',
		description:
			"Splatter ink over the 1st place player's question. They must wipe it off to read the question!",
	},
	[ItemType.SCRAMBLE]: {
		title: 'Scramble',
		description: `Shuffles the answer options for a player of your choice every ${SCRAMBLE_INTERVAL / 1000} seconds.`,
	},
	[ItemType.DR_WHO]: {
		title: 'The Doctor',
		description: `Steals ${DOCTOR_STEAL_TIME / 1000} seconds from a targeted player and adds them to your own timer.`,
	},
	[ItemType.MIRROR]: {
		title: 'Mirror',
		description: 'Reflects the next incoming attack directly back at the sender',
	},
	[ItemType.ALL_IN]: {
		title: 'All In',
		description:
			'High risk, high reward! Earn 2x points for a correct answer, but lose points if you are wrong.',
	},
	[ItemType.FIFTY_FIFTY]: {
		title: '50/50',
		description: 'Eliminates half of the incorrect answer options.',
	},
	[ItemType.HIVEMIND]: {
		title: 'Hive Mind',
		description: 'Reveals the answers currently selected by all other players.',
	},
};
