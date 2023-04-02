import { GRID } from "./config";

export const introCampaign = {
  id: 'introID',
  title: "DM Kit Intro Campaign",
  activeCard: null,
  activeTab: "tab0",
  tabOrder: ["tab0", "tab1"],
  cards: {
    card0: {
      title: "Greetings Traveler!",
      color: "green",
      text: "Welcome to DM Kit, a tool to help plan your next adventure. Take a look at the READ ME tab for more information on functions. If you would like to save your work, please create an account!",
    },
    card1: {
      title: "Tools",
      color: "blue",
      text: "Use the buttons to build your campaign. You can add cards, copy cards, reset the board position. You can also save your progress, but you must first create an account.",
    },
    card2: {
      title: "Tabs",
      color: "blue",
      text: "Use the buttons below to add tabs and switch between them.",
    },
    card3: {
      title: "Library",
      color: "blue",
      text: "All the cards you create are stored in the library, which you can access by clicking the book to the right. The same card can be placed in multiple views and edited from multiple places.",
    },
  },
  views: {
    view0: {
      cardList: {
        card0: {
          pos: {
            x: 5*GRID.size,
            y: 7*GRID.size,
          },
          size: {
            width: 16*GRID.size,
            height: 10*GRID.size,
          },
        },
      },
      lock: false,
      pos: { x: 0, y: 0 },
      scale: 1,
      title: "Welcome!",
    },
    view1: {
      cardList: {
        card1: {
          pos: {
            x: 0,
            y: 0,
          },
          size: {
            width: 8*GRID.size,
            height: 9*GRID.size,
          },
        },
        card2: {
          pos: {
            x: 4*GRID.size,
            y: 20*GRID.size,
          },
          size: {
            width: 10*GRID.size,
            height: 5*GRID.size,
          },
        },
        card3: {
          pos: {
            x: 25*GRID.size,
            y: 3*GRID.size,
          },
          size: {
            width: 10*GRID.size,
            height: 10*GRID.size,
          },
        },
      },
      lock: false,
      pos: { x: 0, y: 0 },
      scale: 1,
      title: "READ ME",
    },
  },
};