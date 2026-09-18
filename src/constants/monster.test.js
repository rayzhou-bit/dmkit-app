import {
  abilityModifier,
  formatModifier,
  buildMonsterContent,
  DEFAULT_SECTION_COLLAPSED,
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
  it('with no args, every value key is empty and collapsed matches the defaults', () => {
    const content = buildMonsterContent();
    for (const key of MONSTER_FIELD_KEYS) {
      expect(content[key]).toBe('');
    }
    expect(content.collapsed).toEqual(DEFAULT_SECTION_COLLAPSED);
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

  it('falls back to defaults for missing collapsed keys', () => {
    const content = buildMonsterContent({ collapsed: { header: true } });
    expect(content.collapsed.header).toBe(true);
    expect(content.collapsed.actions).toBe(DEFAULT_SECTION_COLLAPSED.actions);
    expect(content.collapsed.bonusActions).toBe(DEFAULT_SECTION_COLLAPSED.bonusActions);
  });
});
