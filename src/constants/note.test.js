import {
  buildNoteContent,
  noteHasContent,
  NOTE_FIELD_KEYS,
} from './note';

describe('buildNoteContent', () => {
  it('with no args, every value key is empty ("" or [])', () => {
    const content = buildNoteContent();
    expect(content.portrait).toBe('');
    expect(content.portraitAlt).toBe('');
    expect(content.description).toBe('');
    expect(content.entries).toEqual([]);
    for (const key of NOTE_FIELD_KEYS) {
      expect(content[key]).toBeDefined();
    }
  });

  it('two calls do not share entries array identity', () => {
    const a = buildNoteContent();
    const b = buildNoteContent();
    expect(a.entries).not.toBe(b.entries);
  });

  it('deep-copies entry objects from the source, not just the array', () => {
    const source = { entries: [{ id: 'e1', name: 'Rosa', description: 'Gruff.' }] };
    const content = buildNoteContent(source);
    expect(content.entries).toEqual(source.entries);
    expect(content.entries).not.toBe(source.entries);
    expect(content.entries[0]).not.toBe(source.entries[0]);
  });

  it('round-trips losslessly through JSON (undefined-never-written invariant)', () => {
    const content = buildNoteContent();
    expect(JSON.parse(JSON.stringify(content))).toEqual(content);
  });

  it('copies known keys from a partial source, drops unknown keys', () => {
    const content = buildNoteContent({ description: 'A dim tavern.', notARealField: 'junk' });
    expect(content.description).toBe('A dim tavern.');
    expect(content.notARealField).toBeUndefined();
  });

  it('coerces null/undefined source values to empty strings/arrays', () => {
    const content = buildNoteContent({ description: null, portrait: undefined, entries: undefined });
    expect(content.description).toBe('');
    expect(content.portrait).toBe('');
    expect(content.entries).toEqual([]);
  });

  it('normalizes a legacy string entries value (via normalizeMonsterEntries) into one description-only entry', () => {
    const content = buildNoteContent({ entries: 'Old free text' });
    expect(content.entries).toEqual([{ id: 'legacy', name: '', description: 'Old free text' }]);
  });
});

describe('noteHasContent', () => {
  it.each([
    ['undefined content', undefined, false],
    ['default note content', buildNoteContent(), false],
    ['portrait set', buildNoteContent({ portrait: 'data:...' }), true],
    ['description set', buildNoteContent({ description: 'A dim tavern.' }), true],
    ['description is whitespace only', buildNoteContent({ description: '   ' }), false],
    ['empty entries list', buildNoteContent({ entries: [] }), false],
    ['one all-blank entry', buildNoteContent({ entries: [{ id: 'e1', name: '', description: '' }] }), false],
    ['one entry with only a name', buildNoteContent({ entries: [{ id: 'e1', name: 'Rosa', description: '' }] }), true],
    ['one entry with only a description', buildNoteContent({ entries: [{ id: 'e1', name: '', description: 'Gruff.' }] }), true],
  ])('%s', (_, content, expected) => {
    expect(noteHasContent(content)).toBe(expected);
  });
});
