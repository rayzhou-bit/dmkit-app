import {
  GRID_SIZE,
  DEFAULT_CANVAS_POSITION,
  DEFAULT_CANVAS_SCALE,
  MONSTER_CARD_SIZE,
} from '../../../constants/dimensions';
import { CARD_TYPES } from '../../../constants/cards';
import { buildMonsterContent } from '../../../constants/monster';

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

export const INTRO_CARDS = {
  'card0': {
    title: 'Greetings Traveler!',
    color: 'jungle',
    content: {
      text: 'Welcome to DM Kit, a tool to help plan your next adventure. Take a look at the READ ME tab for more information on functions. If you would like to save your work, please create an account!',
    },
    views: {
      'tab0': {
        pos: {x: 5*GRID_SIZE, y: 7*GRID_SIZE},
        size: {width: 32*GRID_SIZE, height: 20*GRID_SIZE},
      },
    },
  },
  'card1': {
    title: 'Tools',
    color: 'cotton_blue',
    content: {
      text: 'Use the buttons to build your project. You can add cards, copy cards, reset the board position. You can also save your progress, but you must first create an account.',
    },
    views: {
      'tab1': {
        pos: {x: 5*GRID_SIZE, y: 7*GRID_SIZE},
        size: {width: 16*GRID_SIZE, height: 18*GRID_SIZE},
      },
    },
  },
  'card2': {
    title: 'Tabs',
    color: 'cobalt',
    content: {
      text: 'Use the buttons below to add tabs and switch between them.',
    },
    views: {
      'tab1': {
        pos: {x: 8*GRID_SIZE, y: 40*GRID_SIZE},
        size: {width: 20*GRID_SIZE, height: 10*GRID_SIZE},
      },
    },
  },
  'card3': {
    title: 'Library',
    color: 'lavender',
    content: {
      text: 'All the cards you create are stored in the library, which you can access by clicking the book to the right. The same card can be placed in multiple views and edited from multiple places.',
    },
    views: {
      'tab1': {
        pos: {x: 50*GRID_SIZE, y: 6*GRID_SIZE},
        size: {width: 20*GRID_SIZE, height: 20*GRID_SIZE},
      },
    },
  },
  // Sample stat block (5e SRD content) showcasing the monster card type
  // right where a new user first lands.
  'card4': {
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
      'tab0': {
        pos: {x: 45*GRID_SIZE, y: 7*GRID_SIZE},
        size: MONSTER_CARD_SIZE,
      },
    },
  },
};

export const INTRO_TABS = {
  'tab0': {
    title: 'Welcome!',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['card0', 'card4'],
  },
  'tab1': {
    title: 'READ ME',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['card1', 'card2', 'card3'],
  },
};

export const INTRO_PROJECT = {
  title: 'DM Kit',
  viewOrder: ['tab0', 'tab1'],
  activeViewId: 'tab0',
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
