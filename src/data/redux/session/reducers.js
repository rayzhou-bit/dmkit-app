import { createSlice } from '@reduxjs/toolkit';
import { NETWORK_STATUS, DEFAULT_PROJECT } from './constants';

const initialState = {
  status: NETWORK_STATUS.idle,
  popup: {
    id: null,
    type: null,
  },

  campaignList: {},     // campaignId: campaignTitle
  activeCampaignId: null,
  activeCardId: null,

  isProjectEdited: false, // flag for unsaved changes
};

const session = createSlice({
  name: 'session',
  initialState,
  reducers: {
    initialize: () => ({ ...initialState }),
    loadIntro: () => ({
      ...initialState,
      campaignList: {
        'intro_project_id': DEFAULT_PROJECT.intro_project_id,
      },
      activeCampaignId: 'intro_project_id',
    }),

    setStatus: (state, { payload }) => {
      const { status, logging } = payload;
      console.log(`[Status: ${status}]`, logging);
      return ({ ...state, status });
    },

    setPopup: (state, { payload }) => ({ ...state, popup: { ...payload } }),
    resetPopup: (state) => ({ ...state, popup: { id: null, type: null } }),

    loadProjects: (state, { payload }) => ({
      ...state,
      campaignList: payload.projects,
    }),
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

    setIsProjectEdited: (state, { payload }) => ({ ...state, isProjectEdited: payload }),
  },
});

const actions = session.actions;

const { reducer } = session;

export {
  actions,
  initialState,
  reducer,
};
