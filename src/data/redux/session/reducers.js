import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'loading',  // idle, loading or saving
  popup: {
    id: null,
    type: null,
  },

  campaignList: {
    // campaignId: campaignTitle,
  },
  activeCampaignId: null,
  campaignEdit: false,  // flag for any unsaved changes
  introCampaignEdit: false,
};

const session = createSlice({
  name: 'session',
  initialState,
  reducers: {
    initialize: () => ({ ...initialState }),

    setStatus: (state, { payload }) => ({ ...state, status: payload }),

    setPopup: (state, { payload }) => ({ ...state, popup: { ...payload } }),
    resetPopup: (state) => ({ ...state, popup: { id: null, type: null } }),

    addProject: (state, { payload }) => ({
      ...state,
      campaignList: {
        ...state.campaignList,
        [payload.id]: payload.title,
      },
    }),
    removeProject: (state, { payload }) => {
      let newCampaignList = { ...state.campaignList };
      delete newCampaignList[payload.id];
      return {
        ...state,
        campaignList: newCampaignList,
        activeCampaignId: state.activeCampaignId === payload.id ? null : state.activeCampaignId,
      };
    },
    updateProjectTitle: (state, { payload }) => ({
      ...state,
      campaignList: {
        ...state.campaignList,
        [payload.id]: payload.title,
      },
    }),
    updateActiveProject: (state, { payload }) => ({ ...state, activeCampaignId: payload }),
    setProjectEdit: (state, { payload }) => ({ ...state, campaignEdit: payload }),
    setIntroProjectEdit: (state, { payload }) => ({ ...state, introCampaignEdit: payload }),
  },
});

const actions = session.actions;

const { reducer } = session;

export {
  actions,
  initialState,
  reducer,
};
