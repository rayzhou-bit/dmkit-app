import {
  GRID_SIZE,
  DEFAULT_CANVAS_POSITION,
  DEFAULT_CANVAS_SCALE,
  MONSTER_CARD_SIZE,
} from '../../../constants/dimensions';
import { CARD_TYPES } from '../../../constants/cards';
import { buildMonsterContent } from '../../../constants/monster';
import { buildNoteContent } from '../../../constants/note';
import { buildCustomContent, CUSTOM_BLOCK_TYPES } from '../../../constants/custom';

export const DEFAULT_CARD = {
  views: {},
  color: 'gray',
  title: 'untitled',
  type: CARD_TYPES.text,
  content: { text: '' },
  createdOn: Date.now(),
  editedOn: Date.now(),
};

export const DEFAULT_TAB = {
  pos: DEFAULT_CANVAS_POSITION,
  scale: DEFAULT_CANVAS_SCALE,
  title: 'untitled',
  createdOn: Date.now(),
  editedOn: Date.now(),
};

// Every card below needs its own createdOn/editedOn or the Library's
// Newest/Oldest sort (and the card-ref picker's recency sort) has nothing to
// sort by - see loadIntroProject in reducers.js, which does NOT merge
// DEFAULT_CARD over these, so every field the app reads has to be authored
// here explicitly. `n` orders cards oldest -> newest; Start Here (the tab a
// new user is already looking at) is deliberately the newest, so "Newest"
// in the Library surfaces it first, followed by the Barrow, the Bestiary,
// then the Party tab.
const INTRO_BASE_TS = Date.parse('2024-01-01T00:00:00Z');
const ts = (n) => ({
  createdOn: INTRO_BASE_TS + n * 120000 - 60000,
  editedOn: INTRO_BASE_TS + n * 120000,
});

export const INTRO_CARDS = {
  // ---------------------------------------------------------------------
  // Tab 1: "Start Here" - two columns, welcome on the left and the rest on
  // the right. Keep it terse: people click things to find out what they do,
  // so this only covers what isn't discoverable that way (what each card type
  // is for, how references work, and that saving needs an account).
  // ---------------------------------------------------------------------
  'start-welcome': {
    title: "Welcome to DM Kit",
    color: 'jungle',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [
        { id: 'start-welcome-b1', type: CUSTOM_BLOCK_TYPES.text, text: "A canvas for planning your games. Drag cards, resize them, put them wherever makes sense.\n\nCheck out the other tabs for ways to use this app!" },
      ],
    }),
    views: {
      'start': { pos: { x: 8 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 28 * GRID_SIZE, height: 12 * GRID_SIZE } },
    },
    ...ts(24),
  },
  'start-tools': {
    title: "Cards",
    color: 'cotton_blue',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [
        { id: 'start-tools-b1', type: CUSTOM_BLOCK_TYPES.text, text: "Add one from the tool menu on the left." },
        { id: 'start-tools-b2', type: CUSTOM_BLOCK_TYPES.text, text: "stat - a monster or NPC stat block." },
        { id: 'start-tools-b3', type: CUSTOM_BLOCK_TYPES.text, text: "note - a description plus a list of keyed details." },
        { id: 'start-tools-b4', type: CUSTOM_BLOCK_TYPES.text, text: "freeform - any mix of text and images, like this card." },
        { id: 'start-tools-b5', type: CUSTOM_BLOCK_TYPES.text, text: "Type # in any card to link another, like #[The Sunken Barrow - Running It](barrow-hook). Click a chip to jump there." },
      ],
    }),
    views: {
      'start': { pos: { x: 39 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 28 * GRID_SIZE, height: 25 * GRID_SIZE } },
    },
    ...ts(23),
  },
  'start-saving': {
    title: "Saving",
    color: 'chestnut',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [
        { id: 'start-saving-b1', type: CUSTOM_BLOCK_TYPES.text, text: "Saving needs an account - sign in from the header. Until then your work only lives in this browser tab." },
      ],
    }),
    views: {
      'start': { pos: { x: 8 * GRID_SIZE, y: 21 * GRID_SIZE }, size: { width: 28 * GRID_SIZE, height: 9 * GRID_SIZE } },
    },
    ...ts(22),
  },

  // ---------------------------------------------------------------------
  // Tab 2: "The Sunken Barrow" - a three-room beginner dungeon, kept short
  // on purpose: it is sample content a first-time user meets, not a module to
  // read. Entries link to the Bestiary with #[Name](id) tokens, so a monster
  // is one click from the area it appears in. Note-card height is driven by
  // entry count (~80px each), not width, so areas carry two entries apiece.
  // ---------------------------------------------------------------------
  'barrow-hook': {
    title: "The Sunken Barrow",
    color: 'chestnut',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [
        { id: 'barrow-hook-b1', type: CUSTOM_BLOCK_TYPES.text, text: "A three-room dungeon for a first session, built for four 1st-level characters." },
        { id: 'barrow-hook-b2', type: CUSTOM_BLOCK_TYPES.text, text: "Sheep keep going missing from Millbrook. Goblins have dug into the old barrow on the hill - and broken into something much older underneath." },
        { id: 'barrow-hook-b3', type: CUSTOM_BLOCK_TYPES.text, text: "Play the goblins as scared, not suicidal." },
      ],
    }),
    views: {
      'barrow': { pos: { x: 6 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 34 * GRID_SIZE, height: 19 * GRID_SIZE } },
    },
    ...ts(11),
  },
  'barrow-a1': {
    title: "1 - The Barrow Door",
    color: 'sage',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: "The hillside has caved in, opening a crack into the dark. Bones on a rope hang across it.",
      entries: [
        { id: 'barrow-a1-e1', name: "Lookout", description: "One #[Goblin](mon-goblin) hides in the rubble. If it spots the party, it runs to warn the others." },
        { id: 'barrow-a1-e2', name: "Alarm", description: "DC 12 Perception to notice the bone rope before it rattles." },
      ],
    }),
    views: {
      'barrow': { pos: { x: 43 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 34 * GRID_SIZE, height: 32 * GRID_SIZE } },
    },
    ...ts(12),
  },
  'barrow-a2': {
    title: "2 - The Warren",
    color: 'butter',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: "Straw bedding, a cook fire, stolen sacks. A stone slab at the back has been levered open, and cold air comes out of it.",
      entries: [
        { id: 'barrow-a2-e1', name: "Goblins", description: "Two #[Goblin](mon-goblin) raiders, and #[Goblin Boss](mon-goblin-boss) Grix if the alarm went up." },
        { id: 'barrow-a2-e2', name: "Loot", description: "Millbrook's stolen goods, plus a silver whistle worth 10 gp." },
      ],
    }),
    views: {
      'barrow': { pos: { x: 6 * GRID_SIZE, y: 41 * GRID_SIZE }, size: { width: 34 * GRID_SIZE, height: 32 * GRID_SIZE } },
    },
    ...ts(13),
  },
  'barrow-a3': {
    title: "3 - The Sunken Tomb",
    color: 'eggplant',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: "A low stone chamber, centuries older than the goblins. A cracked sarcophagus sits in the middle.",
      entries: [
        { id: 'barrow-a3-e1', name: "Guardian", description: "A #[Skeleton](mon-skeleton) rises when anyone steps inside. It attacks the goblins too." },
        { id: 'barrow-a3-e2', name: "Treasure", description: "A bronze circlet (25 gp), and a sealed iron box nobody here can open." },
      ],
    }),
    views: {
      'barrow': { pos: { x: 43 * GRID_SIZE, y: 41 * GRID_SIZE }, size: { width: 34 * GRID_SIZE, height: 32 * GRID_SIZE } },
    },
    ...ts(14),
  },

  // ---------------------------------------------------------------------
  // Tab 3: "Bestiary" - one stat block per monster the adventure
  // references, all 5e SRD. Goblin's shape (field choices, entry ids) is
  // the template every other stat block below copies.
  // ---------------------------------------------------------------------
  'mon-goblin': {
    title: 'Goblin',
    color: 'forest',
    type: CARD_TYPES.monster,
    content: buildMonsterContent({
      size: 'Small',
      creatureType: 'humanoid (goblinoid)',
      alignment: 'neutral evil',
      armorClass: '15 (leather armor, shield)',
      hitPoints: '7 (2d6)',
      speed: '30 ft.',
      str: '8', dex: '14', con: '10', int: '10', wis: '8', cha: '8',
      skills: 'Stealth +6',
      senses: 'darkvision 60 ft., passive Perception 9',
      languages: 'Common, Goblin',
      challengeRating: '1/4',
      xp: '50',
      traits: [{
        id: 'goblin-trait-nimble-escape',
        name: 'Nimble Escape',
        description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.',
      }],
      actions: [
        {
          id: 'goblin-action-scimitar',
          name: 'Scimitar',
          description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.',
        },
        {
          id: 'goblin-action-shortbow',
          name: 'Shortbow',
          description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        },
      ],
    }),
    views: {
      'bestiary': { pos: { x: 6 * GRID_SIZE, y: 6 * GRID_SIZE }, size: MONSTER_CARD_SIZE },
    },
    ...ts(5),
  },
  'mon-goblin-boss': {
    title: 'Goblin Boss',
    color: 'jungle',
    type: CARD_TYPES.monster,
    content: buildMonsterContent({
      size: 'Small',
      creatureType: 'humanoid (goblinoid)',
      alignment: 'neutral evil',
      armorClass: '17 (chain shirt, shield)',
      hitPoints: '21 (6d6)',
      speed: '30 ft.',
      str: '10', dex: '14', con: '10', int: '10', wis: '8', cha: '10',
      skills: 'Deception +2, Stealth +6',
      senses: 'darkvision 60 ft., passive Perception 9',
      languages: 'Common, Goblin',
      challengeRating: '1',
      xp: '200',
      traits: [{
        id: 'goblinboss-trait-nimble-escape',
        name: 'Nimble Escape',
        description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.',
      }],
      actions: [
        {
          id: 'goblinboss-action-multiattack',
          name: 'Multiattack',
          description: 'The goblin makes two attacks with its scimitar. It can use its shortbow instead of one scimitar attack.',
        },
        {
          id: 'goblinboss-action-scimitar',
          name: 'Scimitar',
          description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.',
        },
        {
          id: 'goblinboss-action-shortbow',
          name: 'Shortbow',
          description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        },
      ],
      reactions: [{
        id: 'goblinboss-reaction-redirect',
        name: 'Redirect Attack',
        description: 'When a creature the goblin can see attacks it with a melee weapon attack, the goblin chooses another goblin within 5 feet of it. The two goblins swap places, and the chosen goblin becomes the target instead.',
      }],
    }),
    views: {
      'bestiary': { pos: { x: 34 * GRID_SIZE, y: 6 * GRID_SIZE }, size: MONSTER_CARD_SIZE },
    },
    ...ts(6),
  },
  'mon-giant-rat': {
    title: 'Giant Rat',
    color: 'chestnut',
    type: CARD_TYPES.monster,
    content: buildMonsterContent({
      size: 'Small',
      creatureType: 'beast',
      alignment: 'unaligned',
      armorClass: '12',
      hitPoints: '7 (2d6)',
      speed: '30 ft.',
      str: '7', dex: '15', con: '11', int: '2', wis: '10', cha: '4',
      senses: 'darkvision 60 ft., passive Perception 10',
      languages: '-',
      challengeRating: '1/8',
      xp: '25',
      traits: [
        {
          id: 'giantrat-trait-keen-smell',
          name: 'Keen Smell',
          description: 'The rat has advantage on Wisdom (Perception) checks that rely on smell.',
        },
        {
          id: 'giantrat-trait-pack-tactics',
          name: 'Pack Tactics',
          description: "The rat has advantage on an attack roll against a creature if at least one of the rat's allies is within 5 feet of the creature and the ally isn't incapacitated.",
        },
      ],
      actions: [{
        id: 'giantrat-action-bite',
        name: 'Bite',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage.',
      }],
    }),
    views: {
      'bestiary': { pos: { x: 62 * GRID_SIZE, y: 6 * GRID_SIZE }, size: MONSTER_CARD_SIZE },
    },
    ...ts(7),
  },
  'mon-wolf': {
    title: 'Wolf',
    color: 'gray',
    type: CARD_TYPES.monster,
    content: buildMonsterContent({
      size: 'Medium',
      creatureType: 'beast',
      alignment: 'unaligned',
      armorClass: '13 (natural armor)',
      hitPoints: '11 (2d8 + 2)',
      speed: '40 ft.',
      str: '12', dex: '15', con: '12', int: '3', wis: '12', cha: '6',
      skills: 'Perception +3, Stealth +4',
      senses: 'passive Perception 13',
      languages: '-',
      challengeRating: '1/4',
      xp: '50',
      traits: [
        {
          id: 'wolf-trait-keen-hearing-smell',
          name: 'Keen Hearing and Smell',
          description: 'The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell.',
        },
        {
          id: 'wolf-trait-pack-tactics',
          name: 'Pack Tactics',
          description: "The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally isn't incapacitated.",
        },
      ],
      actions: [{
        id: 'wolf-action-bite',
        name: 'Bite',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone.',
      }],
    }),
    views: {
      'bestiary': { pos: { x: 90 * GRID_SIZE, y: 6 * GRID_SIZE }, size: MONSTER_CARD_SIZE },
    },
    ...ts(8),
  },
  'mon-skeleton': {
    title: 'Skeleton',
    color: 'cloud',
    type: CARD_TYPES.monster,
    content: buildMonsterContent({
      size: 'Medium',
      creatureType: 'undead',
      alignment: 'lawful evil',
      armorClass: '13 (armor scraps)',
      hitPoints: '13 (2d8 + 4)',
      speed: '30 ft.',
      str: '10', dex: '14', con: '15', int: '6', wis: '8', cha: '5',
      damageVulnerabilities: 'bludgeoning',
      damageImmunities: 'poison',
      conditionImmunities: 'exhaustion, poisoned',
      senses: 'darkvision 60 ft., passive Perception 9',
      languages: "understands the languages it knew in life but can't speak",
      challengeRating: '1/4',
      xp: '50',
      actions: [
        {
          id: 'skeleton-action-multiattack',
          name: 'Multiattack',
          description: 'The skeleton makes two attacks with its shortsword or its shortbow.',
        },
        {
          id: 'skeleton-action-shortsword',
          name: 'Shortsword',
          description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        },
        {
          id: 'skeleton-action-shortbow',
          name: 'Shortbow',
          description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        },
      ],
    }),
    views: {
      'bestiary': { pos: { x: 118 * GRID_SIZE, y: 6 * GRID_SIZE }, size: MONSTER_CARD_SIZE },
    },
    ...ts(9),
  },
  'mon-bandit': {
    title: 'Bandit',
    color: 'red',
    type: CARD_TYPES.monster,
    content: buildMonsterContent({
      size: 'Medium',
      creatureType: 'humanoid (any race)',
      alignment: 'any non-lawful alignment',
      armorClass: '12 (leather armor)',
      hitPoints: '11 (2d8 + 2)',
      speed: '30 ft.',
      str: '11', dex: '12', con: '12', int: '10', wis: '10', cha: '10',
      senses: 'passive Perception 10',
      languages: 'any one language (usually Common)',
      challengeRating: '1/8',
      xp: '25',
      actions: [
        {
          id: 'bandit-action-scimitar',
          name: 'Scimitar',
          description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) slashing damage.',
        },
        {
          id: 'bandit-action-crossbow',
          name: 'Light Crossbow',
          description: 'Ranged Weapon Attack: +3 to hit, range 80/320 ft., one target. Hit: 5 (1d8 + 1) piercing damage.',
        },
      ],
    }),
    views: {
      'bestiary': { pos: { x: 146 * GRID_SIZE, y: 6 * GRID_SIZE }, size: MONSTER_CARD_SIZE },
    },
    ...ts(10),
  },

  // ---------------------------------------------------------------------
  // Tab 4: "Party & Session Prep" - sample PCs plus a reusable checklist.
  // ---------------------------------------------------------------------
  'pc-1': {
    title: 'Thessaly Vane',
    color: 'cotton_blue',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: "Human Cleric (Life Domain), 1st level. AC 18 (chain mail + shield), HP 10, Passive Perception 12. A quiet healer from Millbrook who's tired of burying people the goblins didn't finish off.",
      entries: [
        { id: 'pc1-e1', name: 'Bond', description: 'Her mentor priest was one of the first to go missing - she suspects the barrow, not wolves, took him.' },
        { id: 'pc1-e2', name: 'Goal', description: 'Wants proof the barrow is dealt with, publicly, so the village stops looking to her for miracles.' },
      ],
    }),
    views: {
      'party': { pos: { x: 6 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 25 * GRID_SIZE, height: 32 * GRID_SIZE } },
    },
    ...ts(0),
  },
  'pc-2': {
    title: 'Bram Ironhaul',
    color: 'carrot',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: 'Mountain Dwarf Fighter (Champion), 1st level. AC 18 (chain mail + shield), HP 12, Passive Perception 11. A caravan guard who took the bounty for the coin and stayed for the fight.',
      entries: [
        { id: 'pc2-e1', name: 'Bond', description: 'Owes his old commander a debt he is still paying off in gold sent home every month.' },
        { id: 'pc2-e2', name: 'Goal', description: "Wants a fight worth telling stories about - the goblins alone won't cut it." },
      ],
    }),
    views: {
      'party': { pos: { x: 35 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 25 * GRID_SIZE, height: 32 * GRID_SIZE } },
    },
    ...ts(1),
  },
  'pc-3': {
    title: 'Vesper Quick',
    color: 'eggplant',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: 'Half-Elf Rogue (Thief), 1st level. AC 13 (leather), HP 9, Passive Perception 13. Grew up picking pockets in the city before the watch made it clear she should try somewhere smaller.',
      entries: [
        { id: 'pc3-e1', name: 'Bond', description: "Anything she finds in the tomb is hers first, the party's second - she hasn't told them that part." },
        { id: 'pc3-e2', name: 'Goal', description: 'Looking for a score big enough to buy her way out of Millbrook for good.' },
      ],
    }),
    views: {
      'party': { pos: { x: 64 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 25 * GRID_SIZE, height: 32 * GRID_SIZE } },
    },
    ...ts(2),
  },
  'pc-4': {
    title: 'Oakheart',
    color: 'lichen_green',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: "Wood Elf Ranger, 1st level. AC 14 (studded leather), HP 11, Passive Perception 15. Millbrook's closest thing to a warden - the missing sheep are personal.",
      entries: [
        { id: 'pc4-e1', name: 'Bond', description: 'Has been tracking the goblins for a week and knows the barrow hill better than anyone alive.' },
        { id: 'pc4-e2', name: 'Goal', description: 'Wants to know what the goblins dug up - the tracks changed the day the sheep-killing turned into something worse.' },
      ],
    }),
    views: {
      'party': { pos: { x: 93 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 25 * GRID_SIZE, height: 32 * GRID_SIZE } },
    },
    ...ts(3),
  },
  'prep-checklist': {
    title: 'Session Prep Checklist',
    color: 'gray',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'prep-checklist-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "Before you run this (or any) session:\n\n- Read the hook and the room notes once through so you're not discovering the map live.\n- Skim each monster's stat block in the Bestiary and note anything that changes how it fights (Pack Tactics, Nimble Escape, Redirect Attack).\n- Decide how you'll scale the encounters for your actual party size - see the scaling notes on the hook card.\n- Have the four sample characters above ready to hand out, or swap in your players' own.\n- Set a stopping point in advance. It's fine not to finish everything in one sitting.",
      }],
    }),
    views: {
      'party': { pos: { x: 6 * GRID_SIZE, y: 42 * GRID_SIZE }, size: { width: 40 * GRID_SIZE, height: 22 * GRID_SIZE } },
    },
    ...ts(4),
  },
};

export const INTRO_TABS = {
  'start': {
    title: 'Start Here',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['start-welcome', 'start-tools', 'start-saving'],
  },
  'barrow': {
    title: 'The Sunken Barrow',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['barrow-hook', 'barrow-a1', 'barrow-a2', 'barrow-a3'],
  },
  'bestiary': {
    title: 'Bestiary',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['mon-goblin', 'mon-goblin-boss', 'mon-giant-rat', 'mon-wolf', 'mon-skeleton', 'mon-bandit'],
  },
  'party': {
    title: 'Party & Session Prep',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['pc-1', 'pc-2', 'pc-3', 'pc-4', 'prep-checklist'],
  },
};

export const INTRO_PROJECT = {
  title: 'DM Kit',
  viewOrder: ['start', 'barrow', 'bestiary', 'party'],
  activeViewId: 'start',
  cards: INTRO_CARDS,
  views: INTRO_TABS,
  createdOn: Date.now(),
  editedOn: Date.now(),
};

export const BLANK_PROJECT = {
  title: 'Title',
  viewOrder: ['tab0'],
  activeViewId: 'tab0',
  cards: {},
  views: {
    'tab0': {
      title: 'Title',
      pos: DEFAULT_CANVAS_POSITION,
      scale: 1,
      cards: [],
    },
  },
  createdOn: Date.now(),
  editedOn: Date.now(),
};
