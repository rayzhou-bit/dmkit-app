import { createSlice } from '@reduxjs/toolkit';
import uuid from 'react-uuid';

import { GRID } from '../../../shared/_dimensions';

const initialState = {
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
};

const cards = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    initialize: ({ payload }) => ({ payload }),
    unload: () => ({}),

    createCard: (state, { payload }) => {
      const id = 'card'+uuid();
      return {
        ...state,
        [id]: {
          title: 'Card!',
          color: 'gray',
          content: {
            text: '',
          },
          views: {
            [payload.ActiveView]: {
              pos: {x: 3*GRID.size, y: 3*GRID.size},
              size: {width: 8*GRID.size, height: 10*GRID.size},
            },
          },
        },
      };
    },
    copyCard,
    destroyCard,
    linkCardToView,
    unlinkCardFromView,
    setCardPosition,
    setCardSize,
    setCardTitle,
    setCardColor,
    setCardContentText,
  },
});

const actions = app.actions;

const { reducer } = app;

export {
  actions,
  initialState,
  reducer,
};
