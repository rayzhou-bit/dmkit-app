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
  // Tab 1: "Start Here" - each card sits next to the UI it describes (the
  // tool menu on the left, the library on the right, tabs below, the header
  // above) and points at it, so the layout itself does half the explaining.
  // Keep them terse: people click things to find out what they do.
  // ---------------------------------------------------------------------
  'start-welcome': {
    title: "Welcome to DM Kit",
    color: 'jungle',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'start-welcome-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "A canvas for planning your games. Drag cards, resize them, put them wherever makes sense.\n\nThe other three tabs are samples - pull them apart.",
      }],
    }),
    views: {
      'start': { pos: { x: 26 * GRID_SIZE, y: 2 * GRID_SIZE }, size: { width: 22 * GRID_SIZE, height: 14 * GRID_SIZE } },
    },
    ...ts(18),
  },
  'start-tools': {
    title: "Cards",
    color: 'cotton_blue',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'start-tools-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "\u2190 Click one to add it to this tab.",
      }],
    }),
    views: {
      'start': { pos: { x: 2 * GRID_SIZE, y: 5 * GRID_SIZE }, size: { width: 20 * GRID_SIZE, height: 9 * GRID_SIZE } },
    },
    ...ts(19),
  },
  'start-select': {
    title: "Select a card",
    color: 'butter',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'start-select-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "\u2190 More tools appear down here once something's selected.",
      }],
    }),
    views: {
      'start': { pos: { x: 2 * GRID_SIZE, y: 40 * GRID_SIZE }, size: { width: 20 * GRID_SIZE, height: 9 * GRID_SIZE } },
    },
    ...ts(20),
  },
  'start-undo-save': {
    title: "Undo & saving",
    color: 'chestnut',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'start-undo-save-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "\u2191 Undo, redo, save.\n\nSaving needs an account - until then it's only this browser tab.",
      }],
    }),
    views: {
      'start': { pos: { x: 56 * GRID_SIZE, y: 0 * GRID_SIZE }, size: { width: 18 * GRID_SIZE, height: 8 * GRID_SIZE } },
    },
    ...ts(21),
  },
  'start-library': {
    title: "The Library",
    color: 'lavender',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'start-library-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "Every card you make is in here \u2192\n\nSearch it, or drag a card back onto any tab.",
      }],
    }),
    views: {
      'start': { pos: { x: 76 * GRID_SIZE, y: 4 * GRID_SIZE }, size: { width: 18 * GRID_SIZE, height: 13 * GRID_SIZE } },
    },
    ...ts(22),
  },
  'start-refs': {
    title: "Linking cards",
    color: 'sage',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'start-refs-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "Type # in any card to link another, like #[The Sunken Barrow - Running It](barrow-hook).\n\nClick the chip to jump to it.",
      }],
    }),
    views: {
      'start': { pos: { x: 30 * GRID_SIZE, y: 18 * GRID_SIZE }, size: { width: 28 * GRID_SIZE, height: 12 * GRID_SIZE } },
    },
    ...ts(23),
  },
  'start-tabs': {
    title: "Tabs",
    color: 'cobalt',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [{
        id: 'start-tabs-b1',
        type: CUSTOM_BLOCK_TYPES.text,
        text: "\u2193 Separate views of the same collection. A card can sit in more than one.",
      }],
    }),
    views: {
      'start': { pos: { x: 34 * GRID_SIZE, y: 44 * GRID_SIZE }, size: { width: 24 * GRID_SIZE, height: 9 * GRID_SIZE } },
    },
    ...ts(24),
  },

  // ---------------------------------------------------------------------
  // Tab 2: "The Sunken Barrow" - a short original beginner dungeon. The
  // hook card and every room's entries use #[Name](id) tokens to link to the
  // Bestiary tab, so a monster is one click away from the room it appears in.
  // ---------------------------------------------------------------------
  'barrow-hook': {
    title: 'The Sunken Barrow - Running It',
    color: 'chestnut',
    type: CARD_TYPES.custom,
    content: buildCustomContent({
      blocks: [
        {
          id: 'barrow-hook-b1',
          type: CUSTOM_BLOCK_TYPES.text,
          text: "The Sunken Barrow is a one-session dungeon crawl for four 1st-level characters. A goblin warband has dug into an old hill barrow above the village of Millbrook, and their tunneling broke through into a sealed tomb far older than they are.\n\nThe hook: sheep have gone missing from Millbrook's flocks for two weeks, and a shepherd swears she saw green-skinned raiders dragging a carcass up the barrow hill at dusk. The village offers 50 gp to whoever clears the goblins out, and whatever the party finds underneath is theirs to keep.",
        },
        {
          id: 'barrow-hook-b2',
          type: CUSTOM_BLOCK_TYPES.text,
          text: "Running it: play the goblins as scared and outmatched, not suicidal. #[Grix](mon-goblin-boss) will bargain or flee if a fight turns against her. If the party is having an easy time, the goblins' hunting #[Wolf](mon-wolf) can arrive as reinforcements a few rounds into a loud fight. The #[Skeleton](mon-skeleton) in the tomb is older and colder than anything the goblins understand - play it as grim, not comedic.\n\nScaling: for a party of three, drop one goblin from the Watch Fire and skip the wolf. For a party of five, add a second #[Goblin](mon-goblin) to Grix's Den.",
        },
      ],
    }),
    views: {
      'barrow': { pos: { x: 6 * GRID_SIZE, y: 6 * GRID_SIZE }, size: { width: 36 * GRID_SIZE, height: 40 * GRID_SIZE } },
    },
    ...ts(11),
  },
  'barrow-room-1-door': {
    title: 'Area 1 - The Broken Barrow Door',
    color: 'gray',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: "The barrow hill's south face has collapsed inward, exposing a jagged hole in the old stonework wide enough to duck through. Fresh boot prints - small, bare, clawed - lead inside over scattered rubble. A crude totem of bones and red twine hangs over the opening.",
      entries: [
        { id: 'barrow-r1-e1', name: 'Totem Trap', description: 'The bone totem is rigged to a trip-cord. Anyone who pulls it aside without a DC 12 Wisdom (Perception) check to spot the cord yanks free a stack of loose rocks overhead: DC 13 Dexterity save or take 7 (2d6) bludgeoning damage and alert every goblin in Area 2.' },
        { id: 'barrow-r1-e2', name: 'Goblin Lookout', description: 'A single #[Goblin](mon-goblin) watches the entrance from a rubble pile 20 feet in, using Stealth to stay hidden until it can loose a shortbow shot and flee toward Area 2 to raise the alarm.' },
        { id: 'barrow-r1-e3', name: 'Tracks', description: 'A DC 10 Wisdom (Survival) check reveals two sets of tracks: goblin feet heading in, and a dragged, heavier trail leading toward Area 4 - consistent with a stolen sheep.' },
      ],
    }),
    views: {
      'barrow': { pos: { x: 6 * GRID_SIZE, y: 50 * GRID_SIZE }, size: { width: 32 * GRID_SIZE, height: 44 * GRID_SIZE } },
    },
    ...ts(12),
  },
  'barrow-room-2-watchfire': {
    title: 'Area 2 - The Watch Fire',
    color: 'carrot',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: 'A guttering fire pit lights a wider chamber cluttered with stolen sacks, chicken bones, and a heap of mismatched furs. Two goblins hunch near the flames, sharpening blades and arguing in low voices.',
      entries: [
        { id: 'barrow-r2-e1', name: 'Goblins', description: "Two #[Goblin](mon-goblin) raiders. If the alarm was raised in Area 1, they're ready and fighting from behind the furs (half cover); otherwise they're surprised." },
        { id: 'barrow-r2-e2', name: 'Loot Sacks', description: "The sacks hold Millbrook's stolen goods: a small cook pot, 15 sp, and a shepherd's silver whistle worth 10 gp." },
        { id: 'barrow-r2-e3', name: 'Passage', description: 'A low tunnel to the north leads to Area 3; a wider one east leads to Area 4.' },
      ],
    }),
    views: {
      'barrow': { pos: { x: 42 * GRID_SIZE, y: 50 * GRID_SIZE }, size: { width: 32 * GRID_SIZE, height: 44 * GRID_SIZE } },
    },
    ...ts(13),
  },
  'barrow-room-3-warren': {
    title: 'Area 3 - The Warren',
    color: 'butter',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: 'Bedrolls of straw and stolen blankets fill this cramped den. Something small and quick skitters through a gap in the rubble as torchlight spills in.',
      entries: [
        { id: 'barrow-r3-e1', name: 'Giant Rat', description: 'A #[Giant Rat](mon-giant-rat) nests here and attacks anything that disturbs it. Add a second one for a harder fight.' },
        { id: 'barrow-r3-e2', name: 'Sleeping Goblin', description: 'One #[Goblin](mon-goblin) sleeps off a shift here unless already alerted; it wakes if a fight starts elsewhere in this room.' },
        { id: 'barrow-r3-e3', name: 'Hidden Coin Purse', description: "Buried in a bedroll (DC 12 Investigation): a leather purse with 22 gp - one goblin's private stash." },
        { id: 'barrow-r3-e4', name: 'The Wolf Pack', description: "If the goblins' hunting #[Wolf](mon-wolf) is out on a run when the party arrives, it returns here 1d4 rounds into any loud fight, drawn by the noise." },
      ],
    }),
    views: {
      'barrow': { pos: { x: 78 * GRID_SIZE, y: 50 * GRID_SIZE }, size: { width: 32 * GRID_SIZE, height: 56 * GRID_SIZE } },
    },
    ...ts(14),
  },
  'barrow-room-4-larder': {
    title: 'Area 4 - The Larder',
    color: 'eggplant',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: 'The air turns sour with the smell of butchered meat. Sheep carcasses hang from hooks driven into the old stonework, and a terrified figure is bound and gagged in the corner, watching the door.',
      entries: [
        { id: 'barrow-r4-e1', name: 'The Captive', description: "Denna (a #[Bandit](mon-bandit), but a noncombatant while bound), a scavenger who broke in ahead of the party looking for the tomb's treasure and got caught. Freed, she knows the layout of Area 6 and warns that \"the thing in the box isn't dead\" - a DC 10 Charisma (Persuasion) check gets her help in a fight." },
        { id: 'barrow-r4-e2', name: 'Stolen Livestock', description: "Three butchered sheep account for Millbrook's losses - proof enough to collect the bounty even if the party goes no further." },
        { id: 'barrow-r4-e3', name: 'Secret Door', description: 'A DC 15 Wisdom (Perception) check finds a slab in the east wall, cool to the touch and out of place among the barrow stonework, leading to Area 6.' },
      ],
    }),
    views: {
      'barrow': { pos: { x: 6 * GRID_SIZE, y: 110 * GRID_SIZE }, size: { width: 32 * GRID_SIZE, height: 44 * GRID_SIZE } },
    },
    ...ts(15),
  },
  'barrow-room-5-den': {
    title: "Area 5 - Grix's Den",
    color: 'cobalt',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: 'Furs and looted finery cover a chair worthy of a throne, if you squint. A goblin in mismatched armor snarls orders at two bodyguards flanking her.',
      entries: [
        { id: 'barrow-r5-e1', name: 'Grix, the Goblin Boss', description: 'Grix, a #[Goblin Boss](mon-goblin-boss), fights from the chair, using Redirect Attack to shield herself with her bodyguards. If reduced below half HP, she offers to surrender the tomb key in exchange for her life.' },
        { id: 'barrow-r5-e2', name: 'Bodyguards', description: 'Two #[Goblin](mon-goblin) bodyguards guard Grix and fight to the death for her unless she surrenders.' },
        { id: 'barrow-r5-e3', name: 'Treasure', description: 'A locked chest (Grix carries the key) holds 85 gp, a potion of healing, and a crude iron key etched with spiral markings - it opens the vault door in Area 6.' },
      ],
    }),
    views: {
      'barrow': { pos: { x: 42 * GRID_SIZE, y: 110 * GRID_SIZE }, size: { width: 32 * GRID_SIZE, height: 44 * GRID_SIZE } },
    },
    ...ts(16),
  },
  'barrow-room-6-tomb': {
    title: 'Area 6 - The Sunken Tomb',
    color: 'forest',
    type: CARD_TYPES.note,
    content: buildNoteContent({
      description: 'Goblin digging has torn a ragged hole through into a perfectly circular stone chamber, untouched by the warren above. Spiral carvings older than any language you recognize cover the walls. In the center, a stone sarcophagus lies cracked open - and empty.',
      entries: [
        { id: 'barrow-r6-e1', name: 'The Guardian', description: 'A #[Skeleton](mon-skeleton) rises from behind the sarcophagus the moment anyone crosses the threshold. It was sealed here to guard the tomb, not to serve whoever broke in, and attacks goblins and party alike.' },
        { id: 'barrow-r6-e2', name: 'Vault Door', description: "An iron door in the north wall is locked; Grix's key (Area 5) or a DC 18 Thieves' Tools check opens it without damage. Forcing it (DC 20 Strength) triggers a rockfall: DC 14 Dexterity save or 14 (4d6) bludgeoning damage." },
        { id: 'barrow-r6-e3', name: 'The Vault', description: "Beyond the door: a stone pedestal holding a suit of +1 leather armor and a sealed clay urn of ashes that radiates faint necromancy - what's left of whoever the skeleton once was. What the party does with the ashes is their call to make." },
        { id: 'barrow-r6-e4', name: 'Something Older', description: "The spiral carvings don't match any known culture in the region. That's the hook for a bigger campaign, if you want one." },
      ],
    }),
    views: {
      'barrow': { pos: { x: 78 * GRID_SIZE, y: 110 * GRID_SIZE }, size: { width: 32 * GRID_SIZE, height: 56 * GRID_SIZE } },
    },
    ...ts(17),
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
      'party': { pos: { x: 6 * GRID_SIZE, y: 42 * GRID_SIZE }, size: { width: 40 * GRID_SIZE, height: 28 * GRID_SIZE } },
    },
    ...ts(4),
  },
};

export const INTRO_TABS = {
  'start': {
    title: 'Start Here',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['start-welcome', 'start-tools', 'start-select', 'start-undo-save', 'start-library', 'start-refs', 'start-tabs'],
  },
  'barrow': {
    title: 'The Sunken Barrow',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: [
      'barrow-hook',
      'barrow-room-1-door', 'barrow-room-2-watchfire', 'barrow-room-3-warren',
      'barrow-room-4-larder', 'barrow-room-5-den', 'barrow-room-6-tomb',
    ],
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
