// @ts-check
class Event {
	/** @type {import('../client/SchoolmasterClient')} */
	client;

	/** @type {import('./EventHandler')} */
	handler;

	/**
	 * @param id {string}
	 * @param options {{ emitter?: string, event: string, once?: boolean }}
	 */
	constructor(id, { emitter = 'client', event, once = false }) {
		this.id = id;
		this.emitter = emitter;
		this.event = event;
		this.once = once;
	}

	exec(...args) {
		throw new Error('Event#exec() not implemented');
	}
}

module.exports = Event;
