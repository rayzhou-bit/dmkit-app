import { getActiveRefQuery } from './cardRefQuery';

describe('getActiveRefQuery', () => {
  it('finds a query after "# " at the start of a word, preceded by whitespace', () => {
    const text = 'Talk to #gob';
    expect(getActiveRefQuery(text, text.length)).toEqual({ query: 'gob', start: 8 });
  });

  it('returns null for a mid-word "#" ("a#b")', () => {
    expect(getActiveRefQuery('a#b', 3)).toBeNull();
  });

  it('returns an empty query for a lone "#" at the very start', () => {
    expect(getActiveRefQuery('#', 1)).toEqual({ query: '', start: 0 });
  });

  it('returns null once whitespace follows the query ("#gob ")', () => {
    const text = '#gob ';
    expect(getActiveRefQuery(text, text.length)).toBeNull();
  });

  it('returns null when the caret sits before any "#" in the string', () => {
    expect(getActiveRefQuery('#abc', 0)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(getActiveRefQuery('', 0)).toBeNull();
  });

  it('returns null when there is no "#" at all', () => {
    expect(getActiveRefQuery('just plain text', 5)).toBeNull();
  });

  it('matches the "#" immediately at the caret with nothing typed yet, mid-string', () => {
    const text = 'Talk to # ';
    // caret right after the '#', before the trailing space
    expect(getActiveRefQuery(text, 9)).toEqual({ query: '', start: 8 });
  });

  it('grows the query as more characters are typed after "#"', () => {
    expect(getActiveRefQuery('#g', 2)).toEqual({ query: 'g', start: 0 });
    expect(getActiveRefQuery('#go', 3)).toEqual({ query: 'go', start: 0 });
    expect(getActiveRefQuery('#gob', 4)).toEqual({ query: 'gob', start: 0 });
  });

  it('handles the caret positioned before an earlier "#" (that hashtag is out of scope)', () => {
    // Caret sits right before "#two" - scanning back from there hits
    // whitespace before ever reaching the "#one" further left.
    const text = '#one #two';
    expect(getActiveRefQuery(text, 5)).toBeNull();
  });

  it('with multiple "#"s, resolves to the nearest one behind the caret', () => {
    const text = '#one #two';
    expect(getActiveRefQuery(text, text.length)).toEqual({ query: 'two', start: 5 });
    // Caret inside the first token still resolves to the first "#", not the second.
    expect(getActiveRefQuery(text, 4)).toEqual({ query: 'one', start: 0 });
  });

  it('returns null as soon as scanning back hits whitespace with no "#" yet', () => {
    const text = 'foo #bar baz';
    // caret in the middle of "baz", no '#' anywhere near it
    expect(getActiveRefQuery(text, text.length)).toBeNull();
  });

  it('treats a "#" right after a newline as preceded by whitespace', () => {
    const text = 'line one\n#gob';
    expect(getActiveRefQuery(text, text.length)).toEqual({ query: 'gob', start: 9 });
  });

  it('clamps an out-of-range caret index to the text length', () => {
    expect(getActiveRefQuery('#gob', 999)).toEqual({ query: 'gob', start: 0 });
  });

  it('returns null for non-string/non-number input', () => {
    expect(getActiveRefQuery(null, 0)).toBeNull();
    expect(getActiveRefQuery('#gob', null)).toBeNull();
    expect(getActiveRefQuery(undefined, undefined)).toBeNull();
  });
});
