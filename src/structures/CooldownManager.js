class CooldownManager {
	entries = new Map();

	constructor(cooldown) {
		this.cooldown = cooldown;
	}

	request(key) {
		const now = Date.now();
		const entry = this.entries.get(key);
		if (entry) {
			// on cooldown
			if (entry + this.cooldown > now) return true;

			this.entries.set(key, now);
			return false;
		}

		this.entries.set(key, now);
		return false;
	}

	sweep() {
		const now = Date.now();
		for (const [key, creation] of this.entries) {
			if (creation + this.cooldown <= now) this.entries.delete(key);
		}
	}
}

module.exports = CooldownManager;
