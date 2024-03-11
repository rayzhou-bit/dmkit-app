import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionCreators } from "redux-undo";

import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import { manageUser } from "../../store/firestoreAPI/authTransactions";

import { GRID } from '../../shared/constants/grid';

// TODO separate out the network code into functions data/request or something
//    link the authlistener and app status management to App.js

export const NETWORK_STATUS = {
  idle: 'idle',
  saving: 'saving',
  loading: 'loading',
};

export const CANVAS_STATES = {
  empty: 'empty',
  loading: 'loading',
  loaded: 'loaded',
};

export const CANVAS_DIMENSIONS = {
  width: 100 * GRID.size,
  height: 70 * GRID.size,
};

export const useCanvasHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.userData.userId);
  const status = useSelector(state => state.sessionManager.status || NETWORK_STATUS.idle);
  const activeProject = useSelector(state => state.sessionManager.activeCampaignId || '');
  const isProjectEdited = useSelector(state => state.sessionManager.campaignEdit);
  const isIntroCampaignEdited = useSelector(state => state.sessionManager.introCampaignEdit);
  const activeTab = useSelector(state => state.campaignData.present.activeViewId || '');
  const activeTabPosition = useSelector(state => activeTab ? state.campaignData.present.views[activeTab].pos : null);
  const activeTabScale = useSelector(state => activeTab ? state.campaignData.present.views[activeTab].scale : 1);
  const projectData = useSelector(state => state.campaignData.present);
  const cardCollection = useSelector(state => state.campaignData.present.cards);
  const latestUnfiltered = useSelector(state => state.campaignData._latestUnfiltered);

  const [ canvasState, setCanvasState ] = useState(CANVAS_STATES.empty);
  const [ cardAnimation, setCardAnimation ] = useState({});

  const isLoggedIn = !!userId;
  
  // set canvas state
  useEffect(() => {
    if (status === NETWORK_STATUS.loading) {
      setCanvasState(CANVAS_STATES.loading);
    } else if (!!userId && !!activeProject && !!activeTab) {
      setCanvasState(CANVAS_STATES.loaded);
    } else {
      setCanvasState(CANVAS_STATES.empty);
    }
  }, [status, userId, activeProject, activeTab]);

  // auth listener
  useEffect(() => {
    const authListener = manageUser({
      dispatch,
      introCampaignEdit: isIntroCampaignEdited,
      campaignData: projectData,
    });
    return () => authListener();
  }, [dispatch]);

  // load data for active project
  useEffect(() => {
    if (isLoggedIn) {
      if (activeProject) {
        dispatch(fireactions.fetchCampaignData(
          activeProject,
          () => dispatch(ActionCreators.clearHistory()),
        ));
      } else {
        console.log("[Status] idle. Triggered by activeCampaignId change.");
        dispatch(actions.setStatus(NETWORK_STATUS.idle));
      }
    }
  }, [dispatch, activeProject]);

  // when project data changes, set edited flag
  useEffect(() => {
    if (isLoggedIn) {
      if ((status === NETWORK_STATUS.idle) && !!projectData && (Object.keys(projectData).length !== 0)) {
        if (!isProjectEdited) {
          dispatch(actions.setCampaignEdit(true));
        }
      } else {
        console.log("[Status] idle. Triggered by post-load.");
        dispatch(actions.setStatus(NETWORK_STATUS.idle));
      }
    } else {
      if ((status === NETWORK_STATUS.idle) && !!projectData && (Object.keys(projectData).length !== 0)) {
        if (!isIntroCampaignEdited) {
          dispatch(actions.setIntroCampaignEdit(true));
        }
      } else {
        console.log("[Status] idle. Triggered by post-load.");
        dispatch(actions.setStatus(NETWORK_STATUS.idle));
      }
    }
  }, [dispatch, latestUnfiltered])

  // auto-save every minute
  useEffect(() => {
    const autoSave = setInterval(() => {
      if ((status === NETWORK_STATUS.idle) && isLoggedIn && activeProject && isProjectEdited) {
        console.log("[Status] saving. Triggered by autosave.");
        dispatch(actions.setStatus(NETWORK_STATUS.saving));
        dispatch(fireactions.saveCampaignData(
          activeProject,
          projectData,
          () => {
            console.log("[Status] idle. Triggered by autosave completion.");
            dispatch(actions.setStatus(NETWORK_STATUS.idle));
          }
        ));
      }
    }, 60000);
    return () => clearInterval(autoSave);
  }, [dispatch, status, userId, activeProject, isProjectEdited, projectData]);

  let cardArgs = {};
  for (let card in cardCollection) {
    if (cardCollection[card].views && cardCollection[card].views[activeTab]) {
      cardArgs[card] = {
        key: card,
        cardId: card,
        cardAnimation: cardAnimation,
        setCardAnimation: setCardAnimation,
      };
    }
  }

  return {
    canvasState,
    canvasPosition: activeTabPosition ?? { x: 0, y: 0 },
    canvasScale: activeTabScale,
    cardArgs,
    dragStopHandler: (event, data) => {
      if (activeTabPosition) {
        if (activeTabPosition.x !== data.x || activeTabPosition.y !== data.y) {
          dispatch(actions.updActiveViewPos({ x: data.x, y: data.y }));
        } else {
          dispatch(actions.updActiveViewPos({ x: data.x, y: data.y }));
        }
      }
    },
    wheelHandler: (event) => {
      let newScale = activeTabScale ?? 1;
      newScale += event.deltaY * -0.001;
      newScale = Math.round(newScale * 10) / 10;
      newScale = Math.min(Math.max(GRID.scaleMin, newScale), GRID.scaleMax);
      dispatch(actions.updActiveViewScale(newScale));
    },
    cardDropHandler: (event) => {
      event.preventDefault();
      const droppedCard = event.dataTransfer.getData('text');
      if (cardCollection[droppedCard]) {
        if (!cardCollection[droppedCard].views[activeTab]) {
          // TODO more precise position calculation
          let x = Math.round((event.clientX - GRID.size - GRID.size) / GRID.size) * GRID.size;
          let y = Math.round((event.clientY - GRID.size - GRID.size) / GRID.size) * GRID.size;
          x = (x < 0) ? 0 : x;
          y = (y < 0) ? 0 : y;
          const position = { x, y };
          dispatch(actions.linkCardToView(droppedCard, position));
        } else {
          setCardAnimation({
            ...cardAnimation,
            [droppedCard]: 'card-blink .25s step-end 3 alternate',
          });
        }
      }
    },
    createNewProject: () => dispatch(fireactions.createProject()),
  };
};
