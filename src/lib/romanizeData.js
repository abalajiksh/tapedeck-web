/* Worked examples for the romanization demo in the lyrics section.
 *
 * Every line here is a **constructed phrase lifted from the romanizer's own
 * test suite** in the Tapedeck repository (`src/romanize/*.rs`), with the
 * romanization those tests assert. Two consequences, and both are the point:
 *
 *  1. Nothing on this page is a real lyric. The words Tapedeck fetches are
 *     third-party text that never leaves the instance, and that rule does not
 *     get an exception for a marketing page.
 *  2. Nothing here is illustrative. These are the strings the shipped code
 *     produces. A line earns its place by being pinned by a test, which is
 *     also why there are no examples for the styles that happen to lack one —
 *     inferring what the output "would be" is exactly the kind of quiet guess
 *     the rest of this site exists to avoid.
 *
 * `parts` is the alignment the API really returns: `Part { o, r }` — one Hangul
 * block, one Japanese or Chinese token, one Indic or Russian word. It is what
 * the reader's interlinear view draws, which is why the split is data here
 * rather than something this page works out from a string.
 *
 * `syl` marks parts that are sung syllables, which the reader separates with a
 * dot. Korean only.
 *
 * `spaced` is whether the script itself writes spaces between those parts.
 * Korean, Japanese and Chinese do not; the romanization always does, so the
 * demo cannot join both sides the same way.
 */

export const SCRIPTS = [
	{
		id: 'ko',
		label: 'Korean',
		script: 'Hangul',
		spaced: false,
		blurb:
			'Revised Romanization, applied after the standard pronunciation rules rather than letter by letter — so liaison, assimilation and aspiration all land before the Latin letters are chosen. The parts are sung syllables, and the reader keeps a dot between them, so a long line wraps where a singer would breathe rather than mid-syllable.',
		lines: [
			{
				syl: true,
				rule: 'ㄶ before a vowel',
				parts: [
					['괜', 'gwaen'],
					['찮', 'cha'],
					['아', 'na']
				]
			},
			{
				syl: true,
				rule: 'ㄹㄹ liquidises',
				parts: [
					['몰', 'mol'],
					['라', 'la']
				]
			},
			{
				syl: true,
				rule: 'ㅌ with 이 palatalises to chi',
				parts: [
					['같', 'ga'],
					['이', 'chi']
				]
			},
			{
				syl: true,
				rule: 'a cluster carries over, and the tensing is written once',
				parts: [
					['없', 'eop'],
					['이', 'si']
				]
			},
			{
				syl: true,
				rule: 'ㅎ goes quiet between vowels',
				parts: [
					['좋', 'jo'],
					['은', 'eun']
				]
			},
			{
				syl: true,
				rule: 'ㅂ before ㄴ nasalises',
				parts: [
					['감', 'gam'],
					['사', 'sa'],
					['합', 'ham'],
					['니', 'ni'],
					['다', 'da']
				]
			}
		]
	},
	{
		id: 'ja',
		label: 'Japanese',
		script: 'Kana and kanji',
		spaced: false,
		blurb:
			'Modified Hepburn over a tokenised line, so a kanji is read as the word it belongs to and a particle is read as a particle — は is wa, not ha. Long vowels are spelled out by default and take macrons on a switch. Built without the dictionary, kana is still romanized and ideographs are left as written.',
		lines: [
			{
				rule: 'four tokens, four words',
				parts: [
					['明日', 'ashita'],
					['また', 'mata'],
					['会う', 'au'],
					['とき', 'toki']
				]
			},
			{
				rule: 'は is read wa',
				parts: [
					['カツ', 'katsu'],
					['カレー', 'karee'],
					['は', 'wa'],
					['美味しい', 'oishii']
				]
			},
			{
				rule: 'the kanji read as one word',
				parts: [['東京', 'toukyou']]
			}
		]
	},
	{
		id: 'zh',
		label: 'Chinese',
		script: 'Hanzi',
		spaced: false,
		blurb:
			'Pinyin with tone marks, segmented into words against a dictionary rather than read character by character. That is the whole reason the dictionary is there: one character at a time, a polyphone takes its first listed reading, and 了 comes out liǎo in a line where it is plainly le. Simplified and traditional both read.',
		lines: [
			{
				rule: 'three characters, three tones',
				parts: [
					['我', 'wǒ'],
					['爱', 'ài'],
					['你', 'nǐ']
				]
			},
			{
				rule: '了 is le here, not liǎo',
				parts: [
					['我们', 'wǒmen'],
					['一起', 'yīqǐ'],
					['走', 'zǒu'],
					['了', 'le']
				]
			},
			{
				rule: '行 is háng in this word, not xíng',
				parts: [
					['银行', 'yínháng'],
					['在', 'zài'],
					['那里', 'nàli']
				]
			},
			{
				rule: 'traditional characters, same reading',
				parts: [
					['還', 'hái'],
					['要', 'yào'],
					['多久', 'duōjiǔ']
				]
			}
		]
	},
	{
		id: 'ta',
		label: 'Tamil',
		script: 'Tamil',
		spaced: true,
		blurb:
			'The readable style is how a lyric site spells it, with Tamil voicing applied — a stop between vowels is voiced, so த comes out dh where the strict scheme writes t. ISO 15919 is the other setting: exact, reversible, diacritics throughout, and no voicing at all.',
		lines: [
			{
				rule: 'ற்ற is tr',
				parts: [['காற்றும்', 'kaatrum']]
			},
			{
				rule: 'a doubled stop stays voiceless',
				parts: [['வைத்தாய்', 'vaiththaay']]
			},
			{
				rule: 'ச after ஞ் is j',
				parts: [['பூஞ்சோலையில்', 'poonjolaiyil']]
			},
			{
				rule: 'voicing between vowels',
				parts: [
					['மதம்', 'madham'],
					['பேசு', 'pesu']
				]
			}
		]
	},
	{
		id: 'hi',
		label: 'Hindi',
		script: 'Devanagari',
		spaced: true,
		blurb:
			'The readable style deletes the schwa nobody sings — रंग is rang, not ranga — and spells long vowels aa, ee, oo the way a lyric site does. ISO 15919 keeps every schwa and every diacritic, because a strict scheme that quietly dropped a vowel would not be reversible. Seven more Indian scripts work the same way.',
		lines: [
			{
				rule: 'the final schwa goes',
				parts: [['रंग', 'rang']]
			},
			{
				rule: 'ज्ञ is gy',
				parts: [['ज्ञान', 'gyaan']]
			},
			{
				rule: 'deletion runs right to left',
				parts: [['समझना', 'samajhna']]
			},
			{
				rule: 'the nasal vowel',
				parts: [['नहीं', 'nahin']]
			}
		]
	},
	{
		id: 'ru',
		label: 'Russian',
		script: 'Cyrillic',
		spaced: true,
		blurb:
			"Spelled as written rather than as sung, and that is a decision rather than a shortcut: reading Russian as sung needs the stress, and stress is a dictionary, not a rule. The readable style is Wikipedia's scheme — the spelling you have seen on a sleeve. ISO 9 is the other setting, one Latin letter per Cyrillic one.",
		lines: [
			{
				rule: 'я is ya at the end',
				parts: [['Юлия', 'Yuliya']]
			},
			{
				rule: 'тся comes out tsya',
				parts: [['кажется', 'kazhetsya']]
			},
			{
				rule: 'a stress mark is not a letter, and is dropped',
				parts: [['голова́', 'golova']]
			}
		]
	}
];

/* The style switches, shown as the pairs the tests pin on both sides. Each one
   is a real setting: the Indic and Cyrillic styles are per-user, and the
   Japanese macron switch sits in the reader. */
export const STYLES = [
	{
		what: 'Indian scripts',
		a: 'Readable',
		b: 'ISO 15919',
		pairs: [['नहीं', 'nahin', 'nahīṁ']]
	},
	{
		what: 'Russian',
		a: 'Readable',
		b: 'ISO 9',
		pairs: [
			['Юлия', 'Yuliya', 'Ûliâ'],
			['кажется', 'kazhetsya', 'kažetsâ']
		]
	},
	{
		what: 'Japanese',
		a: 'Spelled out',
		b: 'Macrons',
		pairs: [
			['東京', 'toukyou', 'tōkyō'],
			['カツカレー', 'katsu karee', 'katsu karē']
		]
	}
];

/* Twelve languages: the three that need no introduction, eight Indian scripts,
   and Russian. Listed in full because "and more" is how a claim like this
   usually hides what it does not cover. */
export const ALL_TWELVE = [
	'Korean',
	'Japanese',
	'Chinese',
	'Hindi',
	'Bengali',
	'Punjabi',
	'Gujarati',
	'Tamil',
	'Telugu',
	'Kannada',
	'Malayalam',
	'Russian'
];
