import { parseCardRefs, buildCardRefToken } from './cardRefToken';

describe('parseCardRefs', () => {
  it('returns [] for no text', () => {
    expect(parseCardRefs('')).toEqual([]);
    expect(parseCardRefs(undefined)).toEqual([]);
    expect(parseCardRefs(null)).toEqual([]);
  });

  it('returns one text segment for text with no tokens', () => {
    expect(parseCardRefs('just some text')).toEqual([
      { type: 'text', text: 'just some text', start: 0, end: 14 },
    ]);
  });

  it('a token at the very start', () => {
    const text = '#[Goblin](card1) is nearby';
    expect(parseCardRefs(text)).toEqual([
      { type: 'ref', id: 'card1', title: 'Goblin', start: 0, end: 16 },
      { type: 'text', text: ' is nearby', start: 16, end: 26 },
    ]);
  });

  it('a token at the very end', () => {
    const text = 'Beware the #[Goblin](card1)';
    expect(parseCardRefs(text)).toEqual([
      { type: 'text', text: 'Beware the ', start: 0, end: 11 },
      { type: 'ref', id: 'card1', title: 'Goblin', start: 11, end: 27 },
    ]);
  });

  it('a token in the middle', () => {
    const text = 'Beware the #[Goblin](card1) at night';
    expect(parseCardRefs(text)).toEqual([
      { type: 'text', text: 'Beware the ', start: 0, end: 11 },
      { type: 'ref', id: 'card1', title: 'Goblin', start: 11, end: 27 },
      { type: 'text', text: ' at night', start: 27, end: 36 },
    ]);
  });

  it('several tokens', () => {
    const text = '#[A](a) and #[B](b) and #[C](c)';
    const segments = parseCardRefs(text);
    expect(segments.filter(s => s.type === 'ref').map(s => s.id)).toEqual(['a', 'b', 'c']);
    expect(segments.filter(s => s.type === 'text').map(s => s.text)).toEqual([' and ', ' and ']);
  });

  it('adjacent tokens with no text between them', () => {
    const text = '#[A](a)#[B](b)';
    expect(parseCardRefs(text)).toEqual([
      { type: 'ref', id: 'a', title: 'A', start: 0, end: 7 },
      { type: 'ref', id: 'b', title: 'B', start: 7, end: 14 },
    ]);
  });

  it('an unclosed token is left as literal text', () => {
    const text = 'See #[Goblin](card1 for details';
    expect(parseCardRefs(text)).toEqual([
      { type: 'text', text, start: 0, end: text.length },
    ]);
  });

  it('a malformed token missing the (id) part is left as literal text', () => {
    const text = 'See #[Goblin] for details';
    expect(parseCardRefs(text)).toEqual([
      { type: 'text', text, start: 0, end: text.length },
    ]);
  });

  it('a title containing "(" and "[" (but no "]") parses normally', () => {
    const text = '#[The (Old) Inn [West Gate](card1) awaits';
    expect(parseCardRefs(text)).toEqual([
      { type: 'ref', id: 'card1', title: 'The (Old) Inn [West Gate', start: 0, end: 34 },
      { type: 'text', text: ' awaits', start: 34, end: 41 },
    ]);
  });

  it('a stray "]" inside the title breaks the token, left as literal text', () => {
    // The title capture stops at the first "]" it meets ("[sic]"'s own
    // close), so the character right after doesn't line up with the "("
    // the token format requires - the whole thing fails to match, same as
    // any other malformed token. buildCardRefToken avoids this by stripping
    // "]" from inserted titles in the first place.
    const text = '#[Bar [sic]](card1)';
    expect(parseCardRefs(text)).toEqual([
      { type: 'text', text, start: 0, end: text.length },
    ]);
  });

  it('an empty title', () => {
    const text = '#[](card1)';
    expect(parseCardRefs(text)).toEqual([
      { type: 'ref', id: 'card1', title: '', start: 0, end: 10 },
    ]);
  });
});

describe('buildCardRefToken', () => {
  it('builds the #[Title](id) format', () => {
    expect(buildCardRefToken({ id: 'card1', title: 'Goblin' })).toBe('#[Goblin](card1)');
  });

  it('strips "]" from the title so it cannot close the token early', () => {
    expect(buildCardRefToken({ id: 'card1', title: 'Gob]lin]' })).toBe('#[Goblin](card1)');
  });

  it('leaves "(" and "[" in the title alone', () => {
    expect(buildCardRefToken({ id: 'card1', title: 'Bar (the good one) [old]' })).toBe('#[Bar (the good one) [old](card1)');
  });

  it('defaults a missing/empty title to an empty string', () => {
    expect(buildCardRefToken({ id: 'card1' })).toBe('#[](card1)');
    expect(buildCardRefToken({ id: 'card1', title: '' })).toBe('#[](card1)');
  });

  it('round-trips through parseCardRefs', () => {
    const token = buildCardRefToken({ id: 'card1', title: 'Goblin' });
    expect(parseCardRefs(token)).toEqual([
      { type: 'ref', id: 'card1', title: 'Goblin', start: 0, end: token.length },
    ]);
  });
});
