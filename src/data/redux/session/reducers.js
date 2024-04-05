import { createSlice } from '@reduxjs/toolkit';

export const NETWORK_STATUS = {
  idle: 'idle',
  saving: 'saving',
  loading: 'loading',
};

const initialState = {
  status: NETWORK_STATUS.loading,
  popup: {
    id: null,
    type: null,
  },

  campaignList: {
    // campaignId: campaignTitle,
  },
  activeCampaignId: null,
  activeCardId: null,

  // flags for any unsaved changes
  campaignEdit: false,
  introCampaignEdit: false,
};

const session = createSlice({
  name: 'session',
  initialState,
  reducers: {
    initialize: () => ({ ...initialState }),

    setStatus: (state, { payload }) => {
      const { status, trigger } = payload;
      console.log(`[Status: ${status}]`, trigger);
      return ({ ...state, status });
    },

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
    setActiveProject: (state, { payload }) => ({ ...state, activeCampaignId: payload.id }),
    setActiveCard: (state, { payload }) => ({ ...state, activeCardId: payload.id }),

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
