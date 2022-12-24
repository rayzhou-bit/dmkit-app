import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  title: null,
  activeView: null,
  viewOrder: [],
};

const campaign = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    initialize: (state, { payload }) => ({
      ...state,
      id: payload.id,
      title: payload.title,
      activeView: payload.activeView,
      viewOrder: payload.viewOrder,
    }),
    
    setTitle: (state, { payload }) => ({ state, title: payload }),
    setActiveView: (state, { payload }) => ({ state, activeView: payload }),
    setViewOrder: (state, { payload }) => ({ state, viewOrder: payload }),
  }
});

const actions = campaign.actions;

const { reducer } = campaign;

export {
  actions,
  initialState,
  reducer,
};
