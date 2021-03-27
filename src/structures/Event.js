// @ts-check
class Event {
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

	exec() {
		throw new Error('Event#exec() not implemented');
	}
}

module.exports = Event;
