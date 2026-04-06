import { nanoid } from 'nanoid';
import type * as Party from 'partykit/server';
import { corsHeaders } from './CORS';

export default class API implements Party.Server {
	constructor(readonly room: Party.Room) {}

	async onRequest(req: Party.Request): Promise<Response> {
		const token = this.room.env['SECRET_TOKEN'] as string;

		if (!token) {
			console.error('FATAL: SECRET_TOKEN is not defined in env');
			return new Response('Internal Error', { status: 500, headers: corsHeaders });
		}

		if (req.method === 'OPTIONS') {
			return new Response('', { headers: corsHeaders });
		}

		// GET endpoints
		/*if (req.method === 'GET') {
			if (req.url.endsWith('/roomExists')) {
				return new Response('Pong', { status: 200 });
			}
		}*/

		// POST endpoints
		if (req.method === 'POST') {
			if (req.url.endsWith('/createRoom')) {
				const url = new URL(req.url);

				for (let i = 0; i < 50; i++) {
					const newId = nanoid(6);

					const resp = await fetch(`${url.origin}/parties/main/${newId}`, {
						headers: { token: token },
					});

					if (resp.ok) {
						continue;
					}

					const postNewRoom = await fetch(`${url.origin}/parties/main/${newId}`, {
						method: 'POST',
						headers: { token: token },
					});

					if (!postNewRoom.ok) {
						return new Response(
							`Internal Error: Couldn't create new room: Server responded with ${postNewRoom.status}`,
							{ status: 500, headers: corsHeaders }
						);
					}

					return new Response(newId, { status: 201, headers: corsHeaders });
				}

				return new Response('Internal Error: no new room ID could be found', {
					status: 500,
					headers: corsHeaders,
				});
			}

			if (req.url.endsWith('/roomExists')) {
				const url = new URL(req.url);
				const { roomId } = await req.json<{ roomId: string }>();

				if (!roomId) {
					return new Response('Bad Request', { status: 400, headers: corsHeaders });
				}

				const resp = await fetch(`${url.origin}/parties/main/${roomId}`, {
					headers: { token: token },
				});

				if (resp.ok) {
					return new Response('Room exists', { status: 200, headers: corsHeaders });
				}

				return new Response('Room not found', { status: 404, headers: corsHeaders });
			}
		}

		return new Response('Bad Request', { status: 400, headers: corsHeaders });
	}
}
