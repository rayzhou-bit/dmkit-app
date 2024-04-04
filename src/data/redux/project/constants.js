import { GRID } from '../../../styles/constants';

// TODO future name refactor

export const DEFAULT_CARD_POSITION = {
  x: 3 * GRID.size,
  y: 3 * GRID.size,
};

export const DEFAULT_CARD_SIZE = {
  width: 8 * GRID.size,
  height: 10 * GRID.size,
};

export const DEFAULT_CARD = {
  title: 'Title',
  color: 'gray',
  content: { text: '' },
  views: {},
  createdOn: Date.now(),
  editedOn: Date.now(),
};

export const DEFAULT_TAB_POSITION = {
  x: 0,
  y: 0,
};

export const DEFAULT_TAB = {
  title: 'Title',
  pos: DEFAULT_TAB_POSITION,
  scale: 1,
  createdOn: Date.now(),
  editedOn: Date.now(),
};

export const INTRO_CARDS = {
  card0: {
    title: 'Greetings Traveler!',
    color: 'jungle',
    content: {
      text: 'Welcome to DM Kit, a tool to help plan your next adventure. Take a look at the READ ME tab for more information on functions. If you would like to save your work, please create an account!',
    },
    views: {
      tab0: {
        pos: {x: 5*GRID.size, y: 7*GRID.size},
        size: {width: 16*GRID.size, height: 10*GRID.size},
      },
    },
  },
  card1: {
    title: 'Tools',
    color: 'cotton_blue',
    content: {
      text: 'Use the buttons to build your project. You can add cards, copy cards, reset the board position. You can also save your progress, but you must first create an account.',
    },
    views: {
      tab1: {
        pos: {x: 0, y: 0},
        size: {width: 8*GRID.size, height: 9*GRID.size},
      },
    },
  },
  card2: {
    title: 'Tabs',
    color: 'cobalt',
    content: {
      text: 'Use the buttons below to add tabs and switch between them.',
    },
    views: {
      tab1: {
        pos: {x: 4*GRID.size, y: 20*GRID.size},
        size: {width: 10*GRID.size, height: 5*GRID.size},
      },
    },
  },
  card3: {
    title: 'Library',
    color: 'lavender',
    content: {
      text: 'All the cards you create are stored in the library, which you can access by clicking the book to the right. The same card can be placed in multiple views and edited from multiple places.',
    },
    views: {
      tab1: {
        pos: {x: 25*GRID.size, y: 3*GRID.size},
        size: {width: 10*GRID.size, height: 10*GRID.size},
      },
    },
  },
};

export const INTRO_TABS = {
  tab0: {
    title: 'Welcome!',
    pos: { x: 0, y: 0 },
    scale: 1,
    cards: ['card0'],
  },
  tab1: {
    title: 'READ ME',
    pos: { x: 0, y: 0 },
    scale: 1,
    cards: ['card1', 'card2', 'card3'],
  },
};

export const INTRO_PROJECT = {
  title: 'DM Kit',
  viewOrder: ['tab0', 'tab1'],
  activeCardId: [],
  activeViewId: 'tab0',
  cards: INTRO_CARDS,
  views: INTRO_TABS,
};