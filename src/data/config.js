export const GRID = {
  // in px
  size: 15,       // change grid image in ViewScreen.scss
  scaleMin: 0.5,
  scaleMax: 4,
};

export const CARD = {
  minHeight: GRID.size*9,
  minWidth: GRID.size*9,
  initPos: {
    x: 3*GRID.size,
    y: 3*GRID.size,
  },
  initSize: {
    width: 8*GRID.size,
    height: 10*GRID.size,
  },
};

export const TAB = {
  initLock: true,
  initPos: {
    x: 0,
    y: 0,
  },
  initScale: 1,
};

export const CARD_FONT_SIZE = {
  // in px
  title: 20,
  text: 18,
};

export const VIEW_FONT_SIZE = {
  // in px
  title: 20,
};

export const CARD_COLORS = {
  red: {
    display: 'red',
    edit: 'salmon',
    text: 'white',
  },
  orange: {
    display: 'orange',
    edit: 'navajowhite',
    text: 'black',
  },
  yellow: {
    display: 'yellow',
    edit: 'lightyellow',
    text: 'black',
  },
  green: {
    display: 'green',
    edit: 'lightgreen',
    text: 'white',
  },
  blue: {
    display: 'blue',
    edit: 'lightblue',
    test: 'white',
  },
  purple: {
    display: 'purple',
    edit: 'violet',
    text: 'white',
  },
  gray: {
    display: 'gray',
    edit: 'lightgray',
    text: 'black',
  },
  black: {
    display: 'black',
    edit: 'darkgray',
    text: 'white',
  },
  white: {
    display: 'white',
    edit: 'lightgray',
    text: 'black',
  },
};
