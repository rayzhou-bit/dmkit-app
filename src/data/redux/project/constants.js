import { GRID } from '../../../styles/constants';

export const DEFAULT_CARD_POSITION = {
  x: 3 * GRID.size,
  y: 3 * GRID.size,
};
export const DEFAULT_CARD_SIZE = {
  width: 8 * GRID.size,
  height: 10 * GRID.size,
};
export const DEFAULT_CARD = {
  title: 'untitled',
  color: 'gray',
  content: { text: '' },
  views: {},
  createdOn: Date.now(),
  editedOn: Date.now(),
};

export const DEFAULT_TAB_POSITION = {
  x: 80,
  y: 50,
};
export const DEFAULT_TAB_SCALE = 1;
export const DEFAULT_TAB = {
  title: 'untitled',
  pos: DEFAULT_TAB_POSITION,
  scale: DEFAULT_TAB_SCALE,
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
        pos: {x: 5*GRID.size, y: 7*GRID.size},
        size: {width: 32*GRID.size, height: 20*GRID.size},
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
        pos: {x: 5*GRID.size, y: 7*GRID.size},
        size: {width: 16*GRID.size, height: 18*GRID.size},
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
        pos: {x: 8*GRID.size, y: 40*GRID.size},
        size: {width: 20*GRID.size, height: 10*GRID.size},
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
        pos: {x: 50*GRID.size, y: 6*GRID.size},
        size: {width: 20*GRID.size, height: 20*GRID.size},
      },
    },
  },
};
export const INTRO_TABS = {
  'tab0': {
    title: 'Welcome!',
    pos: DEFAULT_TAB_POSITION,
    scale: 1,
    cards: ['card0'],
  },
  'tab1': {
    title: 'READ ME',
    pos: DEFAULT_TAB_POSITION,
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
      pos: DEFAULT_TAB_POSITION,
      scale: 1,
      cards: [],
    },
  },
  createdOn: Date.now(),
  editedOn: Date.now(),
};
