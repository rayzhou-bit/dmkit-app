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
  it('with no args, every value key is empty and there is no collapsed key', () => {
    const content = buildMonsterContent();
    for (const key of MONSTER_FIELD_KEYS) {
      expect(content[key]).toBe('');
    }
    expect(content.collapsed).toBeUndefined();
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

  it('notes round-trips', () => {
    const content = buildMonsterContent({ notes: 'lair is flooded' });
    expect(content.notes).toBe('lair is flooded');
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
    ['defenses', 'combat'],
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

  it('MONSTER_FIELDS.notes has the expected metadata', () => {
    expect(MONSTER_FIELDS.notes.maxLength).toBe(500);
    expect(MONSTER_FIELDS.notes.multiline).toBe(true);
    expect(MONSTER_FIELDS.notes.hideLabel).toBe(true);
  });

  it('no section lists notes in its fields array', () => {
    for (const section of MONSTER_SECTIONS) {
      expect(section.fields).not.toContain('notes');
    }
  });

  it('DEFAULT_COLLAPSED has exactly one entry per MONSTER_COLLAPSIBLE_KEYS entry', () => {
    expect(Object.keys(DEFAULT_COLLAPSED).sort()).toEqual([...MONSTER_COLLAPSIBLE_KEYS].sort());
  });
});
