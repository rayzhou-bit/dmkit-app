// Field/section metadata for the monster stat-block card type. Deliberately
// does NOT import from ./cards - cards.js imports hasCardContent's needs
// from here instead, keeping the dependency one-directional.

import AcShieldIcon from '../assets/icons/ac-shield.svg';
import HpHeartIcon from '../assets/icons/hp-heart.svg';
import SpeedBoltIcon from '../assets/icons/speed-bolt.svg';

export const MONSTER_SECTION_KEYS = [
  'identity', 'abilities', 'proficiencies',
  'traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions',
];

// The two collapsible columns (Media isn't one - it's structural, not
// metadata-driven).
export const MONSTER_COLUMN_KEYS = ['attributes', 'combat'];

// Validation list for session/reducers.js's setMonsterCollapsed - sections
// and columns share one collapsed-flags map. Must stay disjoint from
// MONSTER_SECTION_KEYS (tested).
export const MONSTER_COLLAPSIBLE_KEYS = [...MONSTER_SECTION_KEYS, ...MONSTER_COLUMN_KEYS];

export const DEFAULT_SECTION_COLLAPSED = {
  identity: false, abilities: false, proficiencies: false,
  traits: false, actions: false,
  bonusActions: true, reactions: true, legendaryActions: true,
};

// Both start collapsed - a new card is small, and expanding a column grows
// the card to fit it (see MONSTER_COLUMN_WIDTH_DELTA below).
export const DEFAULT_COLUMN_COLLAPSED = { attributes: true, combat: true };

// Fallback map for session.monsterCollapse lookups (useMonsterSectionHooks) -
// view metadata, not part of card content.
export const DEFAULT_COLLAPSED = { ...DEFAULT_SECTION_COLLAPSED, ...DEFAULT_COLUMN_COLLAPSED };

export const MONSTER_NOTES_MAX_LENGTH = 500; // scratchpad, not a sixth action block
export const MONSTER_ENTRY_NAME_MAX_LENGTH = 120;
export const MONSTER_ENTRY_TEXT_MAX_LENGTH = 1000;
// Firestore's 1MB doc limit is otherwise only guarded by the portrait's own
// cap - 50 entries * 5 sections * (name+text caps) stays well under that
// even alongside a portrait, but is otherwise an arbitrary sanity ceiling.
export const MONSTER_MAX_ENTRIES_PER_SECTION = 50;

export const MONSTER_FIELDS = {
  notes: { label: 'Quick Notes', placeholder: 'Scratch notes…', maxLength: MONSTER_NOTES_MAX_LENGTH, multiline: true, hideLabel: true },

  size: { label: 'Size', placeholder: 'Large', maxLength: 60 },
  creatureType: { label: 'Type', placeholder: 'dragon (chromatic)', maxLength: 60 },
  alignment: { label: 'Alignment', placeholder: 'chaotic evil', maxLength: 60 },

  // icon: label doubles as the sr-only accessible name AND the hover
  // tooltip text (MonsterTextField) - replaces the inline text label.
  armorClass: { label: 'Armor Class', placeholder: '18', maxLength: 60, icon: AcShieldIcon },
  hitPoints: { label: 'Hit Points', placeholder: '195', maxLength: 60, icon: HpHeartIcon },
  speed: { label: 'Speed', placeholder: '40 ft.', maxLength: 120, icon: SpeedBoltIcon },

  str: { label: 'STR', maxLength: 3, numeric: true },
  dex: { label: 'DEX', maxLength: 3, numeric: true },
  con: { label: 'CON', maxLength: 3, numeric: true },
  int: { label: 'INT', maxLength: 3, numeric: true },
  wis: { label: 'WIS', maxLength: 3, numeric: true },
  cha: { label: 'CHA', maxLength: 3, numeric: true },

  savingThrows: { label: 'Saving Throws', placeholder: 'Dex +6', maxLength: 200 },
  skills: { label: 'Skills', placeholder: 'Perception +13', maxLength: 200 },
  damageVulnerabilities: { label: 'Vulnerabilities', placeholder: 'fire', maxLength: 200 },
  damageResistances: { label: 'Resistances', placeholder: 'cold', maxLength: 200 },
  damageImmunities: { label: 'Immunities', placeholder: 'fire', maxLength: 200 },
  conditionImmunities: { label: 'Condition Immunities', placeholder: 'charmed', maxLength: 200 },
  senses: { label: 'Senses', placeholder: 'darkvision 60 ft.', maxLength: 200 },
  languages: { label: 'Languages', placeholder: 'Common, Draconic', maxLength: 200 },
  challengeRating: { label: 'Challenge', placeholder: '17', maxLength: 20 },
  xp: { label: 'XP', placeholder: '18,000', maxLength: 20 },
  proficiencyBonus: { label: 'Proficiency Bonus', placeholder: '+6', maxLength: 10 },

  // singular/namePlaceholder/textPlaceholder drive MonsterEntry's per-entry
  // labels and placeholders (see the 'entries' layout below) - these 5 are
  // lists of little boxes now, not one big free-text field.
  traits: { label: 'Traits', singular: 'Trait', namePlaceholder: 'Amphibious', textPlaceholder: 'Can breathe air and water.' },
  actions: { label: 'Actions', singular: 'Action', namePlaceholder: 'Scimitar', textPlaceholder: 'Melee Weapon Attack: +7 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) slashing damage.' },
  bonusActions: { label: 'Bonus Actions', singular: 'Bonus Action', namePlaceholder: 'Cunning Action', textPlaceholder: 'Dash, Disengage, or Hide.' },
  reactions: { label: 'Reactions', singular: 'Reaction', namePlaceholder: 'Parry', textPlaceholder: 'Adds 2 to its AC against one melee attack that would hit it.' },
  legendaryActions: { label: 'Legendary Actions', singular: 'Legendary Action', namePlaceholder: 'Detect', textPlaceholder: 'Makes a Wisdom (Perception) check.' },
};

// The 5 Combat sections above - each a list of {id, name, description}
// entries instead of one free-text field. Field key === section key for
// all five (see MONSTER_SECTIONS below).
export const MONSTER_ENTRY_FIELD_KEYS = ['traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions'];
export const isMonsterEntryField = (key) => MONSTER_ENTRY_FIELD_KEYS.includes(key);

// Always a FRESH array (never the same reference twice, even for the same
// input) - buildMonsterContent/DEFAULT_MONSTER_CONTENT rely on this so
// cards never share one mutable array. Tolerates a legacy plain-string
// value (this field's shape before entries existed) by wrapping it in one
// description-only entry with a fixed id, rather than discarding it -
// loadCards/loadProject write Firestore docs into state unnormalized, so
// this is also the read-side guard for that path, not just a migration nicety.
export const normalizeMonsterEntries = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter(entry => entry && typeof entry === 'object')
      .map(entry => ({
        id: String(entry.id ?? ''),
        name: String(entry.name ?? ''),
        description: String(entry.description ?? ''),
      }));
  }
  if (typeof value === 'string' && value.trim()) {
    return [{ id: 'legacy', name: '', description: value }];
  }
  return [];
};

export const entryHasContent = (entry) => Boolean(entry.name.trim() || entry.description.trim());

// One predicate for both string fields and entry-list fields - callers
// (hasCardContent, sectionHasContent) don't need to know which is which.
export const monsterFieldHasContent = (content, key) => isMonsterEntryField(key)
  ? normalizeMonsterEntries(content?.[key]).some(entryHasContent)
  : String(content?.[key] ?? '').trim().length > 0;

export const MONSTER_SECTIONS = [
  { key: 'abilities', title: 'Ability Scores', layout: 'abilities', column: 'attributes', fields: ['str', 'dex', 'con', 'int', 'wis', 'cha'] },
  { key: 'identity', title: 'Creature', layout: 'lines', column: 'attributes', fields: ['size', 'creatureType', 'alignment'] },
  {
    key: 'proficiencies', title: 'Proficiencies & Senses', layout: 'lines', column: 'attributes',
    fields: [
      'savingThrows', 'skills', 'damageVulnerabilities', 'damageResistances', 'damageImmunities',
      'conditionImmunities', 'senses', 'languages', 'challengeRating', 'xp', 'proficiencyBonus',
    ],
  },
  { key: 'traits', title: 'Traits', layout: 'entries', column: 'combat', fields: ['traits'] },
  { key: 'actions', title: 'Actions', layout: 'entries', column: 'combat', fields: ['actions'] },
  { key: 'bonusActions', title: 'Bonus Actions', layout: 'entries', column: 'combat', fields: ['bonusActions'] },
  { key: 'reactions', title: 'Reactions', layout: 'entries', column: 'combat', fields: ['reactions'] },
  { key: 'legendaryActions', title: 'Legendary Actions', layout: 'entries', column: 'combat', fields: ['legendaryActions'] },
];

// Rendered beside the portrait in the Media column, in this order - not
// part of any collapsible section/column, so always visible.
export const MONSTER_MEDIA_FIELDS = ['hitPoints', 'armorClass', 'speed'];

// Left-to-right render order of the two collapsible columns. Media isn't
// here - it's structural, holding a component + one section-less field.
// title is the only user-visible piece - key stays 'attributes' everywhere
// else (session state, CSS class names) since renaming it has no user-facing
// benefit and would touch a lot of unrelated plumbing.
export const MONSTER_COLUMNS = [
  { key: 'attributes', title: 'Stats' },
  { key: 'combat', title: 'Combat' },
];

// How much a card's rendered width grows on top of its persisted/base size
// while a column is expanded - each column's fixed Card.scss width minus
// the 24px collapsed-strip width (184-24, 229-24). Must match Card.scss's
// grid-template-columns exactly.
export const MONSTER_COLUMN_WIDTH_DELTA = {
  attributes: 160,
  combat: 205,
};

// Sum of MONSTER_COLUMN_WIDTH_DELTA for every currently-expanded column.
// Deliberately a pure function of session state, not a stored/dispatched
// value - useCardHooks adds this to the card's persisted width at render
// time, so expansion can never desync from undo history (nothing about it
// is ever written to project state). `collapse` is a card's raw
// session.monsterCollapse[cardId] entry (may be undefined).
export const getMonsterExpansionDelta = (collapse) => MONSTER_COLUMN_KEYS.reduce((sum, key) => {
  const isCollapsed = collapse?.[key] ?? DEFAULT_COLUMN_COLLAPSED[key];
  return isCollapsed ? sum : sum + (MONSTER_COLUMN_WIDTH_DELTA[key] ?? 0);
}, 0);

// Derived, not hand-listed - preserves MONSTER_SECTIONS' canonical order within each column.
export const MONSTER_COLUMN_SECTIONS = MONSTER_COLUMN_KEYS.reduce((acc, key) => ({
  ...acc,
  [key]: MONSTER_SECTIONS.filter(s => s.column === key),
}), {});

// Every value key in content. portrait/portraitAlt/notes and
// MONSTER_MEDIA_FIELDS are likewise section-less (all rendered directly in
// the Media column, not through MONSTER_SECTIONS).
export const MONSTER_FIELD_KEYS = [
  'portrait', 'portraitAlt', 'notes', ...MONSTER_MEDIA_FIELDS,
  ...MONSTER_SECTIONS.flatMap(section => section.fields),
];

export const DEFAULT_MONSTER_CONTENT = {
  ...MONSTER_FIELD_KEYS.reduce((content, key) => ({
    ...content,
    [key]: isMonsterEntryField(key) ? [] : '',
  }), {}),
};

// The one funnel every write path (createCard, copySelectedCard(s)) goes
// through, so a field can never land as undefined/null in the store, and an
// entry-list field always lands as a fresh, normalized array (never shared,
// never the raw/possibly-legacy-string source value).
export const buildMonsterContent = (source) => {
  const content = { ...DEFAULT_MONSTER_CONTENT };
  for (const key of MONSTER_FIELD_KEYS) {
    content[key] = isMonsterEntryField(key)
      ? normalizeMonsterEntries(source?.[key])
      : String(source?.[key] ?? '');
  }
  return content;
};

// null when the score is blank/non-numeric - callers render '—' for that.
export const abilityModifier = (score) => {
  if (score === '' || score === null || score === undefined) return null;
  const n = Number(score);
  return Number.isNaN(n) ? null : Math.floor((n - 10) / 2);
};

export const formatModifier = (mod) => {
  if (mod === null || mod === undefined || Number.isNaN(mod)) return '—';
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
