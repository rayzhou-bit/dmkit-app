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

export const MONSTER_TEXT_MAX_LENGTH = 4000;
export const MONSTER_NOTES_MAX_LENGTH = 500; // scratchpad, not a sixth action block
const PROSE_PLACEHOLDER = '**Multiattack.** The dragon makes three attacks…';

export const MONSTER_FIELDS = {
  notes: { label: 'Quick Notes', placeholder: 'Scratch notes…', maxLength: MONSTER_NOTES_MAX_LENGTH, multiline: true, hideLabel: true },

  size: { label: 'Size', placeholder: 'Large', maxLength: 60 },
  creatureType: { label: 'Type', placeholder: 'dragon (chromatic)', maxLength: 60 },
  alignment: { label: 'Alignment', placeholder: 'chaotic evil', maxLength: 60 },

  // icon: label doubles as the sr-only accessible name AND the hover
  // tooltip text (MonsterTextField) - replaces the inline text label.
  armorClass: { label: 'Armor Class', placeholder: '18 (natural armor)', maxLength: 60, icon: AcShieldIcon },
  hitPoints: { label: 'Hit Points', placeholder: '195 (17d12 + 85)', maxLength: 60, icon: HpHeartIcon },
  speed: { label: 'Speed', placeholder: '40 ft., fly 80 ft.', maxLength: 120, icon: SpeedBoltIcon },

  str: { label: 'STR', maxLength: 3, numeric: true },
  dex: { label: 'DEX', maxLength: 3, numeric: true },
  con: { label: 'CON', maxLength: 3, numeric: true },
  int: { label: 'INT', maxLength: 3, numeric: true },
  wis: { label: 'WIS', maxLength: 3, numeric: true },
  cha: { label: 'CHA', maxLength: 3, numeric: true },

  savingThrows: { label: 'Saving Throws', placeholder: 'Dex +6, Con +11, Wis +7', maxLength: 200 },
  skills: { label: 'Skills', placeholder: 'Perception +13, Stealth +6', maxLength: 200 },
  damageVulnerabilities: { label: 'Vulnerabilities', placeholder: 'fire', maxLength: 200 },
  damageResistances: { label: 'Resistances', placeholder: 'bludgeoning from nonmagical attacks', maxLength: 200 },
  damageImmunities: { label: 'Immunities', placeholder: 'fire', maxLength: 200 },
  conditionImmunities: { label: 'Condition Immunities', placeholder: 'charmed, frightened', maxLength: 200 },
  senses: { label: 'Senses', placeholder: 'blindsight 60 ft., passive Perception 23', maxLength: 200 },
  languages: { label: 'Languages', placeholder: 'Common, Draconic', maxLength: 200 },
  challengeRating: { label: 'Challenge', placeholder: '17', maxLength: 20 },
  xp: { label: 'XP', placeholder: '18,000', maxLength: 20 },
  proficiencyBonus: { label: 'Proficiency Bonus', placeholder: '+6', maxLength: 10 },

  traits: { label: 'Traits', placeholder: PROSE_PLACEHOLDER, maxLength: MONSTER_TEXT_MAX_LENGTH, multiline: true },
  actions: { label: 'Actions', placeholder: PROSE_PLACEHOLDER, maxLength: MONSTER_TEXT_MAX_LENGTH, multiline: true },
  bonusActions: { label: 'Bonus Actions', placeholder: PROSE_PLACEHOLDER, maxLength: MONSTER_TEXT_MAX_LENGTH, multiline: true },
  reactions: { label: 'Reactions', placeholder: PROSE_PLACEHOLDER, maxLength: MONSTER_TEXT_MAX_LENGTH, multiline: true },
  legendaryActions: { label: 'Legendary Actions', placeholder: PROSE_PLACEHOLDER, maxLength: MONSTER_TEXT_MAX_LENGTH, multiline: true },
};

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
  { key: 'traits', title: 'Traits', layout: 'prose', column: 'combat', fields: ['traits'] },
  { key: 'actions', title: 'Actions', layout: 'prose', column: 'combat', fields: ['actions'] },
  { key: 'bonusActions', title: 'Bonus Actions', layout: 'prose', column: 'combat', fields: ['bonusActions'] },
  { key: 'reactions', title: 'Reactions', layout: 'prose', column: 'combat', fields: ['reactions'] },
  { key: 'legendaryActions', title: 'Legendary Actions', layout: 'prose', column: 'combat', fields: ['legendaryActions'] },
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
  ...MONSTER_FIELD_KEYS.reduce((content, key) => ({ ...content, [key]: '' }), {}),
};

// The one funnel every write path (createCard, copySelectedCard(s)) goes
// through, so a field can never land as undefined/null in the store.
export const buildMonsterContent = (source) => {
  const content = { ...DEFAULT_MONSTER_CONTENT };
  for (const key of MONSTER_FIELD_KEYS) {
    content[key] = String(source?.[key] ?? '');
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
