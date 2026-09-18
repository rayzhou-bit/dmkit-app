import { createSlice } from '@reduxjs/toolkit';
import { NETWORK_STATUS } from '../../../constants/states';
import { DEFAULT_PROJECT } from './constants';
import { MONSTER_COLLAPSIBLE_KEYS } from '../../../constants/monster';

const initialState = {
  status: NETWORK_STATUS.idle,
  error: null, // { source, message } for the most recent failed request, or null
  popup: {
    id: null,
    type: null,
  },

  campaignList: {},     // campaignId: campaignTitle
  activeCampaignId: null,
  activeCardId: null,
  selectedCards: [],

  isProjectEdited: false, // flag for unsaved changes

  // Sparse per-card overrides for monster-card section/column collapse -
  // intentionally session-only (not saved), see setMonsterCollapsed below.
  // Orphaned entries for deleted cards are left in place on purpose: deletes
  // are undoable, and cleaning up here would mean undoing a delete brings
  // the card back with its collapse layout silently reset.
  monsterCollapse: {},   // cardId -> { [sectionOrColumnKey]: boolean }
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

    setError: (state, { payload }) => ({ ...state, error: payload }),
    clearError: (state) => ({ ...state, error: null }),

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
      const { id } = payload;
      let newCampaignList = { ...state.campaignList };
      delete newCampaignList[id];
      return {
        ...state,
        campaignList: newCampaignList,
        activeCampaignId: state.activeCampaignId === id ? null : state.activeCampaignId,
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
    setSelectedCards: (state, { payload }) => ({ ...state, selectedCards: payload.cards }),

    setIsProjectEdited: (state, { payload }) => ({ ...state, isProjectEdited: payload }),

    setMonsterCollapsed: (state, { payload }) => {
      const { id, key, collapsed } = payload;
      if (!MONSTER_COLLAPSIBLE_KEYS.includes(key)) return state;
      return {
        ...state,
        monsterCollapse: {
          ...state.monsterCollapse,
          [id]: { ...state.monsterCollapse[id], [key]: collapsed },
        },
      };
    },
  },
});

const actions = session.actions;

const { reducer } = session;

export {
  actions,
  initialState,
  reducer,
};
