// @ts-check

const SwearKind = Object.freeze({
	RACIST: 0,
	DEROGATORY: 1,
	SEXUAL: 2,
});

// | is a word boundary:
//	|ass| will match 'ass' or 'hello ass' or 'you are an ass'
// 	but it will not match 'embarassed' (embarASSed)
// 	if you leave it out (i.e. 'fuck' it will match anywhere)
// 	i.e. 'fuck' will match on 'fuck', 'fucking', 'aafuck'
// 	it's case insensitive by default.
const patterns = [
	{
		name: 'fuck',
		kind: SwearKind.DEROGATORY,
		patterns: ['fuck', '|fck', '|fk'],
	},
	{
		name: 'ass',
		kind: SwearKind.SEXUAL,
		patterns: ['|ass'],
	},
	{
		name: 'bitch',
		kind: SwearKind.DEROGATORY,
		patterns: ['bitch'],
	},
	{
		name: 'slut',
		kind: SwearKind.DEROGATORY,
		patterns: ['slut'],
	},
	{
		name: 'whore',
		kind: SwearKind.DEROGATORY,
		patterns: ['whore'],
	},
	{
		name: 'anus',
		kind: SwearKind.SEXUAL,
		patterns: ['|anus'],
	},
	{
		name: 'africoon',
		kind: SwearKind.RACIST,
		patterns: ['africoon'],
	},
	{
		name: 'nigger',
		kind: SwearKind.RACIST,
		patterns: ['nigger', 'nigga', 'nibba', '|nig'],
	},
	{
		name: 'faggot',
		kind: SwearKind.DEROGATORY,
		patterns: ['|fag'],
	},
];

module.exports = { patterns, SwearKind };
