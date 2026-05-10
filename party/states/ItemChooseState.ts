import { Connection } from 'partykit/server';
import { ActionMessage, ClientMessage, State } from '../../src/lib/shared/schema';
import { GameStateHandler } from './GameStateHandler';
import Server from '../server';

export class ItemChooseState implements GameStateHandler {
	constructor(private server: Server) {}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.ITEM_CHOOSE_CONTINUE:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) break;

				this.server.transitionTo(State.ITEM_DISPLAY);
				break;
		}
	}
}
