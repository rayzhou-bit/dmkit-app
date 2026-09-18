// Field/section metadata for the monster stat-block card type. Deliberately
// does NOT import from ./cards - cards.js imports hasCardContent's needs
// from here instead, keeping the dependency one-directional.

export const MONSTER_SECTION_KEYS = [
  'identity', 'defenses', 'abilities', 'proficiencies',
  'traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions',
];

// The two collapsible columns (Media isn't one - it's structural, not
// metadata-driven).
export const MONSTER_COLUMN_KEYS = ['attributes', 'combat'];

// Single validation list for the reducer - sections and columns share one
// collapsed-flags map. Must stay disjoint from MONSTER_SECTION_KEYS (tested).
export const MONSTER_COLLAPSIBLE_KEYS = [...MONSTER_SECTION_KEYS, ...MONSTER_COLUMN_KEYS];

export const DEFAULT_SECTION_COLLAPSED = {
  identity: false, defenses: false, abilities: false, proficiencies: false,
  traits: false, actions: false,
  bonusActions: true, reactions: true, legendaryActions: true,
};

export const DEFAULT_COLUMN_COLLAPSED = { attributes: false, combat: false };

// The shape content.collapsed actually takes now - reducer/hook/builder use this.
export const DEFAULT_COLLAPSED = { ...DEFAULT_SECTION_COLLAPSED, ...DEFAULT_COLUMN_COLLAPSED };

export const MONSTER_TEXT_MAX_LENGTH = 4000;
export const MONSTER_NOTES_MAX_LENGTH = 500; // scratchpad, not a sixth action block
const PROSE_PLACEHOLDER = '**Multiattack.** The dragon makes three attacks…';

export const MONSTER_FIELDS = {
  notes: { label: 'Quick Notes', placeholder: 'Scratch notes…', maxLength: MONSTER_NOTES_MAX_LENGTH, multiline: true, hideLabel: true },

  size: { label: 'Size', placeholder: 'Large', maxLength: 60 },
  creatureType: { label: 'Type', placeholder: 'dragon (chromatic)', maxLength: 60 },
  alignment: { label: 'Alignment', placeholder: 'chaotic evil', maxLength: 60 },

  armorClass: { label: 'Armor Class', placeholder: '18 (natural armor)', maxLength: 60 },
  hitPoints: { label: 'Hit Points', placeholder: '195 (17d12 + 85)', maxLength: 60 },
  speed: { label: 'Speed', placeholder: '40 ft., fly 80 ft.', maxLength: 120 },

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
  { key: 'identity', title: 'Creature', layout: 'lines', column: 'attributes', fields: ['size', 'creatureType', 'alignment'] },
  { key: 'defenses', title: 'Defenses', layout: 'lines', column: 'combat', fields: ['armorClass', 'hitPoints', 'speed'] },
  { key: 'abilities', title: 'Ability Scores', layout: 'abilities', column: 'attributes', fields: ['str', 'dex', 'con', 'int', 'wis', 'cha'] },
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

// Left-to-right render order of the two collapsible columns. Media isn't
// here - it's structural, holding a component + one section-less field.
export const MONSTER_COLUMNS = [
  { key: 'attributes', title: 'Attributes' },
  { key: 'combat', title: 'Combat' },
];

// Derived, not hand-listed - preserves MONSTER_SECTIONS' canonical order within each column.
export const MONSTER_COLUMN_SECTIONS = MONSTER_COLUMN_KEYS.reduce((acc, key) => ({
  ...acc,
  [key]: MONSTER_SECTIONS.filter(s => s.column === key),
}), {});

// Every value key in content. portrait/portraitAlt/notes are likewise
// section-less (portrait + notes are rendered in the Media column).
export const MONSTER_FIELD_KEYS = [
  'portrait', 'portraitAlt', 'notes',
  ...MONSTER_SECTIONS.flatMap(section => section.fields),
];

export const DEFAULT_MONSTER_CONTENT = {
  ...MONSTER_FIELD_KEYS.reduce((content, key) => ({ ...content, [key]: '' }), {}),
  collapsed: { ...DEFAULT_COLLAPSED },
};

// The one funnel every write path (createCard, copySelectedCard(s)) goes
// through, so a field can never land as undefined/null in the store.
export const buildMonsterContent = (source) => {
  const content = { ...DEFAULT_MONSTER_CONTENT };
  for (const key of MONSTER_FIELD_KEYS) {
    content[key] = String(source?.[key] ?? '');
  }
  content.collapsed = {};
  for (const key of MONSTER_COLLAPSIBLE_KEYS) {
    content.collapsed[key] = typeof source?.collapsed?.[key] === 'boolean'
      ? source.collapsed[key]
      : DEFAULT_COLLAPSED[key];
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
