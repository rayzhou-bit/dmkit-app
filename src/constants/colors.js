export const CARD_COLOR_KEYS = {
  cloud: 'cloud',
  gray: 'gray',
  pink: 'pink',
  lichen_green: 'lichen_green',
  cotton_blue: 'cotton_blue',

  butter: 'butter',
  sage: 'sage',
  lilac: 'lilac',
  orange: 'orange',
  corn: 'corn',

  carrot: 'carrot',
  red: 'red',
  lavender: 'lavender',
  cobalt: 'cobalt',
  chestnut: 'chestnut',

  eggplant: 'eggplant',
  jungle: 'jungle',
  forest: 'forest',
  shadow: 'shadow',
  black: 'black',
};

export const LIGHT_COLORS = [
  'cloud',
  'gray',
  'pink',
  'lichen_green',
  'cotton_blue',

  'butter',
  'sage',
  'lilac',
  'orange',
  'corn',
];

export const DARK_COLORS = [
  'carrot',
  'red',
  'lavender',
  'cobalt',
  'chestnut',

  'eggplant',
  'jungle',
  'forest',
  'shadow',
  'black',
];

// One ring colour per card colour, so a project with every tab in use never
// repeats a hue. Ordered most-distinct-first rather than by card order: tabs
// take these by index, and the card palette opens with two near-identical
// greys, which would make a two-tab project's rings hard to tell apart.
//
// Not the card hexes themselves: a card colour fills a whole title bar, where
// cloud (#F4F4F4) or gray (#CCD6E3) read fine, but the same value drawn as a
// 5px stroke on white is invisible. These are the same families pushed to a
// weight that survives as a line, which also keeps a ring reading as "a tab"
// rather than "a card that happens to be this colour".
export const TAB_RING_COLORS = [
  '#5BC5FF', // cotton_blue
  '#FF9A2E', // orange
  '#7FBF7B', // lichen_green
  '#B07EE8', // lavender
  '#F08AA6', // pink

  '#5FA3AC', // sage
  '#E8B33D', // butter
  '#8E9BFF', // lilac
  '#ED5E31', // carrot
  '#2F7A46', // jungle

  '#D84C4C', // red
  '#0E77D8', // cobalt
  '#A87C64', // chestnut
  '#6B51A8', // eggplant
  '#1E6060', // forest

  '#C9A61F', // corn
  '#6E88AD', // gray
  '#5A6276', // shadow
  '#8EA0B5', // cloud
  '#2B2B2B', // black
];
