// @ts-check
const { patterns, SwearKind } = require('./patterns');
const { sanitize } = require('./sanitize');
const PatternMatcher = require('./PatternMatcher');

const automaton = new PatternMatcher();

const toAdd = [];
for (const { patterns: pats, ...metadata } of patterns) {
	for (const pat of pats) toAdd.push({ pattern: pat, metadata });
}
automaton.setPatterns(toAdd);

function directMatch(text) {
	return automaton.search(text);
}

function match(text) {
	const { normal, indices } = sanitize(text);
	const matches = automaton.search(normal);
	for (const match of matches) {
		match.startIndex = indices[match.startIndex];
		match.endIndex = indices[match.endIndex];
	}

	return matches;
}

module.exports = { directMatch, match };
