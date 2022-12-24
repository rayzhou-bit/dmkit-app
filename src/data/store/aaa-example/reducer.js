import { createSlice } from "@reduxjs/toolkit";

// ID Generation:
//   campaign id will hold the "campaign-"+uuid
//   card id will be "card-"+uuid
//   view id will be "view-"+uuid

const initialState = {
  campaign: {
    id: null,
    title: null,
    activeView: null,
    viewOrder: [],
  },
  cards: {
    // exampleCardId: {
    //   title: "card title",
    //   color: "card color",
    //   content: {
    //     text: "card text",
    //   },
    //   views: {
    //     viewId: {
    //       pos: {
    //         x: "x-position",
    //         y: "y-position",
    //       },
    //       size: {
    //         height: "height",
    //         width: "width",
    //       },
    //     },
    //   },
    // },
  },
  views: {
    // exampleViewId: {
    //   title: "view title",
    //   color: "view color",
    //   pos: {
    //     x: "view x offset",
    //     y: "view y offset",
    //   },
    // },
  },
};

const app = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initialize: (state, { payload }) => ({
      ...state,
    }),

    loadCampaign: () => ({}),
    loadIntroCampaign: () => ({}),
    
    // campaign
    updCampaignTitle: () => ({}),
    
    setCampaign: () => ({}),
    setCards: () => ({}),
    setViews: () => ({}),
  }
});

const actions = app.actions;

const { reducer } = app;

export {
  actions,
  initialState,
  reducer,
};
