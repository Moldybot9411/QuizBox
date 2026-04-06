import { Connection } from 'partykit/server';
import { ActionMessage, ClientMessage, State } from '../../src/lib/shared/schema';
import type Server from '../server';
import { GameStateHandler } from './GameStateHandler';

export class PostgameState implements GameStateHandler {
	constructor(private server: Server) {}

	onMessage(message: ClientMessage, sender: Connection): void {
		switch (message.action) {
			case ActionMessage.BACK_TO_LOBBY:
				if (!this.server.isSenderAdmin(sender, message.adminSecret)) break;

				this.server.softReset();

				this.server.broadcastSync();
				break;
		}
	}
}
