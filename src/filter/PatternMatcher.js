// @ts-check
const Denque = require('denque');
const { getCode } = require('@skyra/char');

const UPPER_A = getCode('A');
const UPPER_Z = getCode('Z');

const LOWER_A = getCode('a');
const LOWER_Z = getCode('z');

class PatternMatcher {
	rootNode = new TrieNode();

	/** @param {Pattern[]} patterns */
	addPatterns(patterns) {
		for (let i = 0; i < patterns.length; i++) {
			let { pattern, metadata } = patterns[i];
			let wordBoundaryAtEnd = false;
			if (pattern.endsWith('|')) {
				wordBoundaryAtEnd = true;
				pattern = pattern.slice(0, -1);
			}

			let wordBoundaryAtStart = false;
			if (pattern.startsWith('|')) {
				wordBoundaryAtStart = true;
				pattern = pattern.slice(1);
			}

			let currentNode = this.rootNode;
			for (let j = 0; j < pattern.length; j++) {
				const char = pattern.charCodeAt(j);
				const childNode = currentNode.children.get(char);
				if (childNode) currentNode = childNode;
				else {
					const newChildNode = new TrieNode();
					currentNode.children.set(char, newChildNode);
					currentNode = newChildNode;
				}
			}

			currentNode.patternIndex = i;
			currentNode.length = pattern.length;
			currentNode.metadata = metadata;
			currentNode.wordBoundaryAtEnd = wordBoundaryAtEnd;
			currentNode.wordBoundaryAtStart = wordBoundaryAtStart;
		}

		this._buildLinks();
		return this;
	}

	_buildLinks() {
		this.rootNode.suffixLink = this.rootNode;

		// Run a breadth first search to build suffix and output links
		const queue = new Denque();
		for (const childNode of this.rootNode.children.values()) {
			queue.push(childNode);
			childNode.suffixLink = this.rootNode;
		}

		while (!queue.isEmpty()) {
			const node = queue.shift();
			for (const [char, childNode] of node.children) {
				let temp = node.suffixLink;
				// Find longest proper suffix
				while (!temp.children.has(char) && temp !== this.rootNode) temp = temp.suffixLink;

				const link = temp.children.get(char);
				if (link) childNode.suffixLink = link;
				else childNode.suffixLink = this.rootNode;

				queue.push(childNode);
			}

			// set up output links
			if (node.suffixLink.patternIndex >= 0) node.outputLink = node.suffixLink;
			else node.outputLink = node.suffixLink.outputLink;
		}
	}

	search(str) {
		/** @type {PatternMatch[]} */
		const matches = [];

		let parent = this.rootNode;
		for (let i = 0; i < str.length; i++) {
			let c = str.charCodeAt(i);
			// convert to lower by flipping 5th bit
			if (UPPER_A <= c && c <= UPPER_Z) c ^= 0x20;
			const child = parent.children.get(c);
			if (child) {
				parent = child;
				if (parent.patternIndex >= 0) {
					const startIndex = i - parent.length + 1;

					const ok =
						(!parent.wordBoundaryAtStart ||
							startIndex === 0 ||
							!PatternMatcher.isAlpha(str.charCodeAt(startIndex - 1))) &&
						(!parent.wordBoundaryAtEnd || i === str.length - 1 || !PatternMatcher.isAlpha(str.charCodeAt(i + 1)));
					if (ok) {
						matches.push({ patternIndex: parent.patternIndex, endIndex: i, startIndex, metadata: parent.metadata });
					}
				}

				let temp = parent.outputLink;
				while (temp) {
					const startIndex = i - temp.length + 1;
					const ok =
						(!temp.wordBoundaryAtStart ||
							startIndex === 0 ||
							!PatternMatcher.isAlpha(str.charCodeAt(startIndex - 1))) &&
						(!temp.wordBoundaryAtEnd || i === str.length - 1 || !PatternMatcher.isAlpha(str.charCodeAt(i + 1)));

					if (ok) matches.push({ patternIndex: temp.patternIndex, endIndex: i, startIndex, metadata: temp.metadata });
					temp = temp.outputLink;
				}
			} else {
				while (parent !== this.rootNode && !parent.children.has(c)) parent = parent.suffixLink;
				if (parent.children.has(c)) --i;
			}
		}

		return matches;
	}

	static isAlpha(c) {
		return (UPPER_A <= c && c <= UPPER_Z) || (LOWER_A <= c && c <= LOWER_Z);
	}
}

/**
 * @typedef {Object} PatternMatch
 * @property {number} patternIndex
 * @property {number} endIndex
 * @property {number} startIndex
 * @property {Object} metadata
 */

/**
 * @typedef {Object} Pattern
 * @property {string} pattern
 * @property {Object} metadata
 */

class TrieNode {
	children = new Map();
	suffixLink = null;
	outputLink = null;
	patternIndex = -1;
	length = -1;
	metadata = null;
	wordBoundaryAtStart = false;
	wordBoundaryAtEnd = false;
}

module.exports = PatternMatcher;
