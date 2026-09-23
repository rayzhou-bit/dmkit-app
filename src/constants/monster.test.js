import {
  abilityModifier,
  formatModifier,
  buildMonsterContent,
  DEFAULT_COLLAPSED,
  MONSTER_COLLAPSIBLE_KEYS,
  MONSTER_SECTION_KEYS,
  MONSTER_COLUMN_KEYS,
  MONSTER_COLUMNS,
  MONSTER_COLUMN_SECTIONS,
  MONSTER_SECTIONS,
  MONSTER_FIELDS,
  MONSTER_FIELD_KEYS,
  MONSTER_ENTRY_FIELD_KEYS,
  isMonsterEntryField,
  normalizeMonsterEntries,
  entryHasContent,
  monsterFieldHasContent,
  normalizeNotesBlocks,
} from './monster';

describe('abilityModifier', () => {
  it.each([
    [1, -5], [8, -1], [10, 0], [11, 0], [18, 4], [20, 5], [30, 10],
    ['', null], ['abc', null], [undefined, null],
  ])('%p -> %p', (score, expected) => {
    expect(abilityModifier(score)).toBe(expected);
  });
});

describe('formatModifier', () => {
  it.each([
    [5, '+5'], [-1, '-1'], [0, '+0'], [null, '—'],
  ])('%p -> %p', (mod, expected) => {
    expect(formatModifier(mod)).toBe(expected);
  });
});

describe('buildMonsterContent', () => {
  it('with no args, every value key is empty (entry fields: [], others: "") except notes, which starts with one empty text block', () => {
    const content = buildMonsterContent();
    for (const key of MONSTER_FIELD_KEYS) {
      if (key === 'notes') continue;
      expect(content[key]).toEqual(isMonsterEntryField(key) ? [] : '');
    }
    expect(content.notes).toEqual([{ id: 'starter', type: 'text', text: '', image: '', alt: '' }]);
    expect(content.collapsed).toBeUndefined();
  });

  it('a defined source with no notes key gets an empty notes list, not a starter block - only a truly-new card (no source at all) does', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    expect(content.notes).toEqual([]);
  });

  it('two calls do not share entry-array identity', () => {
    const a = buildMonsterContent();
    const b = buildMonsterContent();
    for (const key of MONSTER_ENTRY_FIELD_KEYS) {
      expect(a[key]).not.toBe(b[key]);
    }
  });

  it('deep-copies entry objects from the source, not just the array', () => {
    const source = { actions: [{ id: 'e1', name: 'Scimitar', description: 'Slash.' }] };
    const content = buildMonsterContent(source);
    expect(content.actions).toEqual(source.actions);
    expect(content.actions).not.toBe(source.actions);
    expect(content.actions[0]).not.toBe(source.actions[0]);
  });

  it('round-trips losslessly through JSON (undefined-never-written invariant)', () => {
    const content = buildMonsterContent();
    expect(JSON.parse(JSON.stringify(content))).toEqual(content);
  });

  it('copies known keys from a partial source, drops unknown keys', () => {
    const content = buildMonsterContent({
      creatureType: 'dragon', armorClass: '18', notARealField: 'junk',
    });
    expect(content.creatureType).toBe('dragon');
    expect(content.armorClass).toBe('18');
    expect(content.notARealField).toBeUndefined();
  });

  it('coerces null/undefined source values to empty strings', () => {
    const content = buildMonsterContent({ creatureType: null, alignment: undefined });
    expect(content.creatureType).toBe('');
    expect(content.alignment).toBe('');
  });

  it('a stray collapsed key on the source cannot leak into content', () => {
    const content = buildMonsterContent({ collapsed: { identity: true } });
    expect(content.collapsed).toBeUndefined();
  });

  it('notes given as a block array round-trips', () => {
    const content = buildMonsterContent({ notes: [{ id: 'n1', type: 'text', text: 'lair is flooded' }] });
    expect(content.notes).toEqual([{ id: 'n1', type: 'text', text: 'lair is flooded', image: '', alt: '' }]);
  });

  it('a legacy plain-string notes value wraps into one text block, text preserved', () => {
    const content = buildMonsterContent({ notes: 'lair is flooded' });
    expect(content.notes).toEqual([{ id: 'legacy', type: 'text', text: 'lair is flooded', image: '', alt: '' }]);
  });
});

describe('section/column metadata', () => {
  it('MONSTER_COLUMN_KEYS and MONSTER_SECTION_KEYS are disjoint', () => {
    const overlap = MONSTER_COLUMN_KEYS.filter(key => MONSTER_SECTION_KEYS.includes(key));
    expect(overlap).toEqual([]);
  });

  it.each(MONSTER_SECTIONS.map(s => [s.key, s.column]))('%s has a column in MONSTER_COLUMN_KEYS (%s)', (key, column) => {
    expect(MONSTER_COLUMN_KEYS).toContain(column);
  });

  it('MONSTER_COLUMN_SECTIONS partitions MONSTER_SECTIONS exactly', () => {
    const partitioned = MONSTER_COLUMN_KEYS.flatMap(key => MONSTER_COLUMN_SECTIONS[key]);
    expect(partitioned.length).toBe(MONSTER_SECTIONS.length);
    expect(partitioned.map(s => s.key).sort()).toEqual(MONSTER_SECTION_KEYS.slice().sort());
  });

  it.each([
    ['identity', 'attributes'],
    ['abilities', 'attributes'],
    ['proficiencies', 'attributes'],
    ['traits', 'combat'],
    ['actions', 'combat'],
    ['bonusActions', 'combat'],
    ['reactions', 'combat'],
    ['legendaryActions', 'combat'],
  ])('%s is placed in the %s column', (sectionKey, columnKey) => {
    expect(MONSTER_SECTIONS.find(s => s.key === sectionKey).column).toBe(columnKey);
  });

  it('MONSTER_COLUMNS lists attributes then combat', () => {
    expect(MONSTER_COLUMNS.map(c => c.key)).toEqual(['attributes', 'combat']);
  });

  it('MONSTER_FIELD_KEYS includes notes', () => {
    expect(MONSTER_FIELD_KEYS).toContain('notes');
  });

  it('MONSTER_FIELDS.notes has a visible "Notes" label (matches the heading elsewhere)', () => {
    expect(MONSTER_FIELDS.notes.label).toBe('Notes');
    expect(MONSTER_FIELDS.notes.hideLabel).toBeFalsy();
  });

  it('no section lists notes in its fields array', () => {
    for (const section of MONSTER_SECTIONS) {
      expect(section.fields).not.toContain('notes');
    }
  });

  it('DEFAULT_COLLAPSED has exactly one entry per MONSTER_COLLAPSIBLE_KEYS entry', () => {
    expect(Object.keys(DEFAULT_COLLAPSED).sort()).toEqual([...MONSTER_COLLAPSIBLE_KEYS].sort());
  });

  it('both Attributes and Combat default to collapsed - a new card starts small', () => {
    expect(DEFAULT_COLLAPSED.attributes).toBe(true);
    expect(DEFAULT_COLLAPSED.combat).toBe(true);
  });

  it.each(MONSTER_ENTRY_FIELD_KEYS)('%s is an entries-layout section with a singular label', (key) => {
    const section = MONSTER_SECTIONS.find(s => s.key === key);
    expect(section.layout).toBe('entries');
    expect(section.fields).toEqual([key]);
    expect(MONSTER_FIELDS[key].singular).toBeTruthy();
  });
});

describe('normalizeMonsterEntries', () => {
  it('well-formed entries pass through unchanged, as a new array', () => {
    const entries = [{ id: 'e1', name: 'Scimitar', description: 'Slash.' }];
    const result = normalizeMonsterEntries(entries);
    expect(result).toEqual(entries);
    expect(result).not.toBe(entries);
  });

  it('drops unknown keys and coerces missing name/description to ""', () => {
    const result = normalizeMonsterEntries([{ id: 'e1', extra: 'junk' }]);
    expect(result).toEqual([{ id: 'e1', name: '', description: '' }]);
  });

  it('filters out non-object entries', () => {
    expect(normalizeMonsterEntries([null, 'x', 5, { id: 'e1', name: 'ok', description: '' }]))
      .toEqual([{ id: 'e1', name: 'ok', description: '' }]);
  });

  it.each([undefined, null, '', 0, {}])('%p -> []', (value) => {
    expect(normalizeMonsterEntries(value)).toEqual([]);
  });

  it('a non-empty legacy string becomes one description-only entry with a fixed id', () => {
    expect(normalizeMonsterEntries('**Multiattack.** …')).toEqual([
      { id: 'legacy', name: '', description: '**Multiattack.** …' },
    ]);
  });

  it('a blank/whitespace-only legacy string is treated as empty', () => {
    expect(normalizeMonsterEntries('   ')).toEqual([]);
  });
});

describe('entryHasContent', () => {
  it.each([
    [{ id: 'e1', name: '', description: '' }, false],
    [{ id: 'e1', name: '  ', description: '  ' }, false],
    [{ id: 'e1', name: 'Scimitar', description: '' }, true],
    [{ id: 'e1', name: '', description: 'Slash.' }, true],
  ])('%p -> %p', (entry, expected) => {
    expect(entryHasContent(entry)).toBe(expected);
  });
});

describe('monsterFieldHasContent', () => {
  it('string field: same trim semantics as before', () => {
    expect(monsterFieldHasContent({ size: '' }, 'size')).toBe(false);
    expect(monsterFieldHasContent({ size: '  ' }, 'size')).toBe(false);
    expect(monsterFieldHasContent({ size: 'Large' }, 'size')).toBe(true);
    expect(monsterFieldHasContent({}, 'size')).toBe(false);
  });

  it('entry field: empty list or all-blank entries -> false', () => {
    expect(monsterFieldHasContent({ actions: [] }, 'actions')).toBe(false);
    expect(monsterFieldHasContent({}, 'actions')).toBe(false);
    expect(monsterFieldHasContent({ actions: [{ id: 'e1', name: '', description: '' }] }, 'actions')).toBe(false);
  });

  it('entry field: a name-only or description-only entry -> true', () => {
    expect(monsterFieldHasContent({ actions: [{ id: 'e1', name: 'Bow', description: '' }] }, 'actions')).toBe(true);
    expect(monsterFieldHasContent({ actions: [{ id: 'e1', name: '', description: 'Ranged.' }] }, 'actions')).toBe(true);
  });

  it('notes: empty list, or one all-blank block (the fresh-card starter) -> false', () => {
    expect(monsterFieldHasContent({ notes: [] }, 'notes')).toBe(false);
    expect(monsterFieldHasContent({}, 'notes')).toBe(false);
    expect(monsterFieldHasContent({ notes: [{ id: 'starter', type: 'text', text: '' }] }, 'notes')).toBe(false);
  });

  it('notes: a filled text or image block -> true', () => {
    expect(monsterFieldHasContent({ notes: [{ id: 'n1', type: 'text', text: 'wounded' }] }, 'notes')).toBe(true);
    expect(monsterFieldHasContent({ notes: [{ id: 'n1', type: 'image', image: 'data:...' }] }, 'notes')).toBe(true);
  });

  it('notes: a legacy plain string is recognized as content too (read-path backward compatibility)', () => {
    expect(monsterFieldHasContent({ notes: 'wounded, flees at 50hp' }, 'notes')).toBe(true);
    expect(monsterFieldHasContent({ notes: '   ' }, 'notes')).toBe(false);
  });
});

describe('normalizeNotesBlocks', () => {
  it('a non-empty legacy string wraps into one text block with a fixed id', () => {
    expect(normalizeNotesBlocks('lair is flooded')).toEqual([
      { id: 'legacy', type: 'text', text: 'lair is flooded', image: '', alt: '' },
    ]);
  });

  it('a whitespace-only legacy string is treated as no content, not a blank block', () => {
    expect(normalizeNotesBlocks('   ')).toEqual([]);
  });

  it('an already-array value passes through normalizeCustomBlocks unchanged', () => {
    const blocks = [{ id: 'n1', type: 'text', text: 'x' }];
    expect(normalizeNotesBlocks(blocks)).toEqual([{ id: 'n1', type: 'text', text: 'x', image: '', alt: '' }]);
  });

  it('undefined/null -> []', () => {
    expect(normalizeNotesBlocks(undefined)).toEqual([]);
    expect(normalizeNotesBlocks(null)).toEqual([]);
  });
});
