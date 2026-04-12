import type * as Party from 'partykit/server';
import { ClientMessage } from '../../src/lib/shared/schema';

export interface GameStateHandler {
	/**
	 * Gets called when the state is entered
	 */
	onEnter?(): void;

	/**
	 * Gets called when the state is changed
	 */
	onLeave?(): void;

	/**
	 * Gets called when a new player joins in this game state
	 */
	onConnect?(connection: Party.Connection): void;

	/**
	 * Gets called when a new player leaves in this game state
	 */
	onClose?(connection: Party.Connection): void;

	/**
	 * OnMessage logic for this specific Game State
	 */
	onMessage(message: ClientMessage, sender: Party.Connection): void;
}
