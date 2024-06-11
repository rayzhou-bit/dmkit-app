import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { actions } from '../../data/redux';
import * as api from '../../data/api/database';

import { NETWORK_STATUS, CANVAS_STATES } from '../../constants/states';
import {
  GRID_SIZE,
  GRID_SCALE,
  DEFAULT_CANVAS_POSITION,
  DEFAULT_CANVAS_SCALE,
} from '../../constants/dimensions';
import { ANIMATION } from '../Card/hooks';

export const useCanvasHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const status = useSelector(state => state.session.status || NETWORK_STATUS.idle);
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const activeTab = useSelector(state => state.project.present.activeViewId || '');
  const activeTabPosition = useSelector(state => activeTab ? state.project.present.views[activeTab]?.pos : DEFAULT_CANVAS_POSITION);
  const activeTabScale = useSelector(state => activeTab ? state.project.present.views[activeTab]?.scale : DEFAULT_CANVAS_SCALE);
  const cardCollection = useSelector(state => state.project.present.cards);

  const [ canvasState, setCanvasState ] = useState(CANVAS_STATES.empty);
  const [ cardAnimation, setCardAnimation ] = useState({});
  
  // set canvas state
  useEffect(() => {
    if (status === NETWORK_STATUS.loading) {
      setCanvasState(CANVAS_STATES.loading);
    } else if (!!activeProject && !!activeTab) {
      setCanvasState(CANVAS_STATES.loaded);
    } else {
      setCanvasState(CANVAS_STATES.empty);
    }
  }, [status, userId, activeProject, activeTab]);

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
    canvasPosition: activeTabPosition ?? { x: 80, y: 48 },
    canvasScale: activeTabScale,
    cardArgs,
    dragStopHandler: (event, data) => {
      if (activeTabPosition) {
        if (activeTabPosition.x !== data.x || activeTabPosition.y !== data.y) {
          dispatch(actions.project.setActiveTabPosition({
            position: { x: data.x, y: data.y },
          }));
        }
      } else {
        dispatch(actions.project.setActiveTabPosition({
          position: { x: data.x, y: data.y },
        }));
      }
    },
    wheelHandler: (event) => {
      let newScale = activeTabScale ?? 1;
      newScale += event.deltaY * -0.001;
      newScale = Math.round(newScale * 10) / 10;
      newScale = Math.min(Math.max(GRID_SCALE.min, newScale), GRID_SCALE.max);
      dispatch(actions.project.setActiveTabScale({ scale: newScale }));
    },
    cardDropHandler: (event) => {
      event.preventDefault();
      const droppedCard = event.dataTransfer.getData('text');
      if (cardCollection[droppedCard]) {
        if (!cardCollection[droppedCard].views[activeTab]) {
          // TODO more precise position calculation
          let x = Math.round((event.clientX - GRID_SIZE - GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
          let y = Math.round((event.clientY - GRID_SIZE - GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
          x = (x < 0) ? 0 : x;
          y = (y < 0) ? 0 : y;
          const position = { x, y };
          dispatch(actions.project.linkCardToView({ id: droppedCard, position}));
        } else {
          setCardAnimation({
            ...cardAnimation,
            [droppedCard]: ANIMATION.cardBlink,
          });
        }
      }
    },
    createNewProject: () => dispatch(api.createAndSwitchToEmptyProject()),
  };
};
