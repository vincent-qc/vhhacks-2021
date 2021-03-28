// @ts-check
class TextHighlighter {
	endIndex = -1;
	parts = [];

	constructor(text) {
		this._text = text;
	}

	highlight(start, end) {
		if (this.endIndex > start) return this;
		this.parts.push([start, end]);
		return this;
	}

	getText() {
		if (!this.parts.length) return this._text;
		let text = '';
		let last = 0;
		for (const [start, end] of this.parts) {
			text += this._text.slice(last, start);
			text += '__';
			text += this._text.slice(start, end + 1);
			text += '__';

			last = end + 1;
		}

		text += this._text.slice(last);

		return text;
	}
}

module.exports = { TextHighlighter };
