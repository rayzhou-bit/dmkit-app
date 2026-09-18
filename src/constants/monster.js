// Field/section metadata for the monster stat-block card type. Deliberately
// does NOT import from ./cards - cards.js imports hasCardContent's needs
// from here instead, keeping the dependency one-directional.

export const MONSTER_SECTION_KEYS = [
  'header', 'defenses', 'abilities', 'proficiencies',
  'traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions',
];

export const DEFAULT_SECTION_COLLAPSED = {
  header: false, defenses: false, abilities: false, proficiencies: false,
  traits: false, actions: false,
  bonusActions: true, reactions: true, legendaryActions: true,
};

export const MONSTER_TEXT_MAX_LENGTH = 4000;
const PROSE_PLACEHOLDER = '**Multiattack.** The dragon makes three attacks…';

export const MONSTER_FIELDS = {
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

// Prose (free-text) field keys - the five one-textarea sections.
export const MONSTER_TEXT_KEYS = ['traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions'];

export const MONSTER_SECTIONS = [
  { key: 'header', title: 'Creature', layout: 'header', fields: ['size', 'creatureType', 'alignment'] },
  { key: 'defenses', title: 'Combat', layout: 'lines', fields: ['armorClass', 'hitPoints', 'speed'] },
  { key: 'abilities', title: 'Ability Scores', layout: 'abilities', fields: ['str', 'dex', 'con', 'int', 'wis', 'cha'] },
  {
    key: 'proficiencies', title: 'Proficiencies & Senses', layout: 'lines',
    fields: [
      'savingThrows', 'skills', 'damageVulnerabilities', 'damageResistances', 'damageImmunities',
      'conditionImmunities', 'senses', 'languages', 'challengeRating', 'xp', 'proficiencyBonus',
    ],
  },
  { key: 'traits', title: 'Traits', layout: 'prose', fields: ['traits'] },
  { key: 'actions', title: 'Actions', layout: 'prose', fields: ['actions'] },
  { key: 'bonusActions', title: 'Bonus Actions', layout: 'prose', fields: ['bonusActions'] },
  { key: 'reactions', title: 'Reactions', layout: 'prose', fields: ['reactions'] },
  { key: 'legendaryActions', title: 'Legendary Actions', layout: 'prose', fields: ['legendaryActions'] },
];

// Every value key in content, header's portrait/portraitAlt included (not
// listed in MONSTER_SECTIONS' header.fields, since those two are rendered
// by MonsterPortrait, not MonsterTextField).
export const MONSTER_FIELD_KEYS = [
  'portrait', 'portraitAlt',
  ...MONSTER_SECTIONS.flatMap(section => section.fields),
];

export const DEFAULT_MONSTER_CONTENT = {
  ...MONSTER_FIELD_KEYS.reduce((content, key) => ({ ...content, [key]: '' }), {}),
  collapsed: { ...DEFAULT_SECTION_COLLAPSED },
};

// The one funnel every write path (createCard, copySelectedCard(s)) goes
// through, so a field can never land as undefined/null in the store.
export const buildMonsterContent = (source) => {
  const content = { ...DEFAULT_MONSTER_CONTENT };
  for (const key of MONSTER_FIELD_KEYS) {
    content[key] = String(source?.[key] ?? '');
  }
  content.collapsed = {};
  for (const key of MONSTER_SECTION_KEYS) {
    content.collapsed[key] = typeof source?.collapsed?.[key] === 'boolean'
      ? source.collapsed[key]
      : DEFAULT_SECTION_COLLAPSED[key];
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
