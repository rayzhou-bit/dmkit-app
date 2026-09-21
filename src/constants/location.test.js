import {
  buildLocationContent,
  locationHasContent,
  LOCATION_FIELD_KEYS,
} from './location';

describe('buildLocationContent', () => {
  it('with no args, every value key is empty ("" or [])', () => {
    const content = buildLocationContent();
    expect(content.portrait).toBe('');
    expect(content.portraitAlt).toBe('');
    expect(content.description).toBe('');
    expect(content.entries).toEqual([]);
    for (const key of LOCATION_FIELD_KEYS) {
      expect(content[key]).toBeDefined();
    }
  });

  it('two calls do not share entries array identity', () => {
    const a = buildLocationContent();
    const b = buildLocationContent();
    expect(a.entries).not.toBe(b.entries);
  });

  it('deep-copies entry objects from the source, not just the array', () => {
    const source = { entries: [{ id: 'e1', name: 'Rosa', description: 'Gruff.' }] };
    const content = buildLocationContent(source);
    expect(content.entries).toEqual(source.entries);
    expect(content.entries).not.toBe(source.entries);
    expect(content.entries[0]).not.toBe(source.entries[0]);
  });

  it('round-trips losslessly through JSON (undefined-never-written invariant)', () => {
    const content = buildLocationContent();
    expect(JSON.parse(JSON.stringify(content))).toEqual(content);
  });

  it('copies known keys from a partial source, drops unknown keys', () => {
    const content = buildLocationContent({ description: 'A dim tavern.', notARealField: 'junk' });
    expect(content.description).toBe('A dim tavern.');
    expect(content.notARealField).toBeUndefined();
  });

  it('coerces null/undefined source values to empty strings/arrays', () => {
    const content = buildLocationContent({ description: null, portrait: undefined, entries: undefined });
    expect(content.description).toBe('');
    expect(content.portrait).toBe('');
    expect(content.entries).toEqual([]);
  });

  it('normalizes a legacy string entries value (via normalizeMonsterEntries) into one description-only entry', () => {
    const content = buildLocationContent({ entries: 'Old free text' });
    expect(content.entries).toEqual([{ id: 'legacy', name: '', description: 'Old free text' }]);
  });
});

describe('locationHasContent', () => {
  it.each([
    ['undefined content', undefined, false],
    ['default location content', buildLocationContent(), false],
    ['portrait set', buildLocationContent({ portrait: 'data:...' }), true],
    ['description set', buildLocationContent({ description: 'A dim tavern.' }), true],
    ['description is whitespace only', buildLocationContent({ description: '   ' }), false],
    ['empty entries list', buildLocationContent({ entries: [] }), false],
    ['one all-blank entry', buildLocationContent({ entries: [{ id: 'e1', name: '', description: '' }] }), false],
    ['one entry with only a name', buildLocationContent({ entries: [{ id: 'e1', name: 'Rosa', description: '' }] }), true],
    ['one entry with only a description', buildLocationContent({ entries: [{ id: 'e1', name: '', description: 'Gruff.' }] }), true],
  ])('%s', (_, content, expected) => {
    expect(locationHasContent(content)).toBe(expected);
  });
});
