import { uniqueTitle, titlesInUse, FALLBACK_TITLE } from './uniqueTitle';

describe('uniqueTitle', () => {
  it('leaves a title that nothing else uses alone', () => {
    expect(uniqueTitle('Goblin', ['Wolf'])).toBe('Goblin');
  });

  it('appends 2 on the first collision', () => {
    expect(uniqueTitle('Goblin', ['Goblin'])).toBe('Goblin 2');
  });

  it('takes the lowest free number, not one past the highest', () => {
    expect(uniqueTitle('Goblin', ['Goblin', 'Goblin 3'])).toBe('Goblin 2');
  });

  it('skips numbers already taken', () => {
    expect(uniqueTitle('Goblin', ['Goblin', 'Goblin 2', 'Goblin 3'])).toBe('Goblin 4');
  });

  // Copying a copy shouldn't stack suffixes.
  it('counts up from a title that already ends in a number', () => {
    expect(uniqueTitle('Goblin 2', ['Goblin 2'])).toBe('Goblin 3');
    expect(uniqueTitle('Goblin 2', ['Goblin 2', 'Goblin 3'])).toBe('Goblin 4');
  });

  it('trims before comparing, so trailing space is not a loophole', () => {
    expect(uniqueTitle('  Goblin  ', ['Goblin'])).toBe('Goblin 2');
  });

  it('falls back for an empty or missing title', () => {
    expect(uniqueTitle('', [])).toBe(FALLBACK_TITLE);
    expect(uniqueTitle(undefined, [])).toBe(FALLBACK_TITLE);
    expect(uniqueTitle('   ', [FALLBACK_TITLE])).toBe(`${FALLBACK_TITLE} 2`);
  });

  it('treats a bare number as its own stem rather than producing a leading space', () => {
    expect(uniqueTitle('2', ['2'])).toBe('2 2');
  });

  it('accepts a Set as well as an array', () => {
    expect(uniqueTitle('Goblin', new Set(['Goblin']))).toBe('Goblin 2');
  });
});

describe('titlesInUse', () => {
  const cards = { a: { title: 'Goblin' }, b: { title: 'Wolf' }, c: { title: '  ' } };

  it('collects every title', () => {
    expect(titlesInUse(cards)).toEqual(new Set(['Goblin', 'Wolf']));
  });

  // Renaming a card must not count its own current title, or committing an
  // unchanged title would bump it every single time.
  it('excludes the card being renamed', () => {
    expect(titlesInUse(cards, 'a')).toEqual(new Set(['Wolf']));
  });

  it('handles missing cards without throwing', () => {
    expect(titlesInUse(undefined)).toEqual(new Set());
  });
});
