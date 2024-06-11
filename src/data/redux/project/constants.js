import {
  GRID_SIZE,
  DEFAULT_CANVAS_POSITION,
  DEFAULT_CANVAS_SCALE,
} from '../../../constants/dimensions';

export const DEFAULT_CARD = {
  title: 'untitled',
  color: 'gray',
  content: { text: '' },
  views: {},
  createdOn: Date.now(),
  editedOn: Date.now(),
};

export const DEFAULT_TAB = {
  title: 'untitled',
  pos: DEFAULT_CANVAS_POSITION,
  scale: DEFAULT_CANVAS_SCALE,
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
};

export const INTRO_TABS = {
  'tab0': {
    title: 'Welcome!',
    pos: DEFAULT_CANVAS_POSITION,
    scale: 1,
    cards: ['card0'],
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
