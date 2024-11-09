import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { actions, selectors } from '../../data/redux';
import * as api from '../../data/api/database';

import { NETWORK_STATUS, CANVAS_STATES } from '../../constants/states';
import {
  GRID_SIZE,
  GRID_SCALE,
  DEFAULT_CANVAS_POSITION,
  MAX_CANVAS_SCALE,
  MIN_CANVAS_SCALE,
} from '../../constants/dimensions';
import { ANIMATION } from '../Card/hooks';

const checkCardInSelection = (selectArea, cardArea) => {
  const {start, end} = selectArea;
  const {pos, size} = cardArea;
  if (!start || !end || !pos || !size) {
    return false;
  }
  let leftBound = start.x;
  let rightBound = end.x;
  if (end.x < start.x) {
    leftBound = end.x;
    rightBound = start.x;
  }
  let topBound = start.y;
  let bottomBound = end.y;
  if (end.y < start.y) {
    topBound = end.y;
    bottomBound = start.y;
  }
  // The following checks if the card is outside of the bounds.
  // check if card is left or right of bounds
  if (pos.x + size.width < leftBound || pos.x > rightBound) {
    return false;
  }
  // check if card is top or bottom of bounds
  if (pos.y + size.height < topBound || pos.y > bottomBound) {
    return false;
  }
  return true;
};

export const useCanvasHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.userId);
  const status = useSelector(state => state.session.status || NETWORK_STATUS.idle);
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const activeTab = useSelector(state => state.project.present.activeViewId || '');
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);
  const activeTabScale = useSelector(selectors.project.activeTabScale);

  const [ canvasState, setCanvasState ] = useState(CANVAS_STATES.empty);
  const [ isPanning, setIsPanning ] = useState(false);
  const [ startPan, setStartPan ] = useState({ x: 0, y: 0 });

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

  const beginPanning = (event) => {
    if (event.button == 1) {
      setIsPanning(true);
      setStartPan({
        x: event.clientX - activeTabPosition.x,
        y: event.clientY - activeTabPosition.y,
      });
    }
  };

  const endPanning = () => {
    setIsPanning(false);
  };

  const updatePanning = (event) => {
    if (isPanning) {
      dispatch(actions.project.setActiveTabPosition({
        position: {
          x: event.clientX - startPan.x,
          y: event.clientY - startPan.y,
        },
      }));
    }
  };
  
  const wheelHandler = (event) => {
    let scaleDiff = 0;
    if (event.deltaY < 0) {
      // Zoom in
      if (activeTabScale < MAX_CANVAS_SCALE) {
        scaleDiff = 0.1;
      }
    } else {
      // Zoom out
      if (activeTabScale > MIN_CANVAS_SCALE) {
        scaleDiff = -0.1;
      }
    }
    // Adjust canvas positioning after zooming in or out
    dispatch(actions.project.setActiveTabPosition({
      position: {
        x: activeTabPosition.x - (scaleDiff * event.clientX),
        y: activeTabPosition.y - (scaleDiff * event.clientY),
      },
    }));
    dispatch(actions.project.setActiveTabScale({ scale: activeTabScale + scaleDiff }));
  };

  return {
    canvasState,
    canvasPosition: activeTabPosition ?? DEFAULT_CANVAS_POSITION,
    canvasScale: activeTabScale ?? 1,
    isPanning,
    beginPanning,
    endPanning,
    updatePanning,
    wheelHandler,
    createNewProject: () => dispatch(api.createAndSwitchToEmptyProject()),
  };
};


export const useMultiSelectHooks = ({
  canvasRef,
  selectRef,
}) => {
  const dispatch = useDispatch();
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);
  const activeTabScale = useSelector(selectors.project.activeTabScale);
  const activeTabCardsDimensions = useSelector(selectors.project.activeTabCardsDimensions);
  // const selectedCards = useSelector(state => state.session.selectedCards)

  const [ isMouseDown, setIsMouseDown ] = useState(false);
  const [ selectArea, setSelectArea ] = useState({
    start: undefined,
    end: undefined,
  });
  const [ selectStyle, setSelectStyle ] = useState(null);

  const updateSelect = (event) => {
    setSelectArea(prev => ({
      ...prev,
      end: {
        x: (event.clientX - activeTabPosition.x) / activeTabScale,
        y: (event.clientY - activeTabPosition.y) / activeTabScale,
      },
    }));
  };

  const canvasMouseDownHandler = (event) => {
    if (event.button === 0) {
      setIsMouseDown(true);
      // TODO The following line refers to a specific className. Probably not the best to implement this way.
      if (canvasRef.current && event.target.classList.contains('canvas')) {
        document.addEventListener('mousemove', updateSelect);
        setSelectArea({
          start: {
            x: (event.clientX - activeTabPosition.x) / activeTabScale,
            y: (event.clientY - activeTabPosition.y) / activeTabScale,
          },
          end: {
            x: (event.clientX - activeTabPosition.x) / activeTabScale,
            y: (event.clientY - activeTabPosition.y) / activeTabScale,
          },
        });
      };
    }
  };

  const canvasMouseUpHandler = (event) => {
    setIsMouseDown(false);
    document.removeEventListener('mousemove', updateSelect);
    setSelectArea({
      start: undefined,
      end: undefined,
    });
  };

  // set up mousedown and mouseup events
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('mousedown', canvasMouseDownHandler);
      document.addEventListener('mouseup', canvasMouseUpHandler);

      return () => {
        canvasElement.removeEventListener('mousedown', canvasMouseDownHandler);
        document.removeEventListener('mouseup', canvasMouseUpHandler);
      };
    }
  }, [canvasRef.current, activeTabPosition, activeTabScale]);

  // update selection area style when selection area state changes
  useEffect(() => {
    const selectElement = selectRef.current;
    if (selectElement) {
      const { start, end } = selectArea;
      const border = `1px solid #C1E9FF`;
      let left = null;
      let width = null;
      let top = null;
      let height = null;
      if (start && end) {
        if (end.x > start.x) {
          left = `${start.x}px`;
          width = `${end.x - start.x}px`;
        } else  {
          left = `${end.x}px`;
          width = `${start.x - end.x}px`;
        }
        if (end.y > start.y) {
          top = `${start.y}px`;
          height = `${end.y - start.y}px`;
        } else {
          top = `${end.y}px`;
          height = `${start.y - end.y}px`;
        }
        setSelectStyle({ left, top, width, height, border });
      } else {
        setSelectStyle({ border: null });
      }
    }
  }, [selectArea, activeTabPosition, activeTabScale, selectRef.current]);

  // update selected cards when selection area state changes
  useEffect(() => {
    if (isMouseDown) {
      let selectedCards = [];
      for (let cardId in activeTabCardsDimensions) {
        if (checkCardInSelection(selectArea, activeTabCardsDimensions[cardId])) {
          selectedCards.push(cardId);
        }
      }
      dispatch(actions.session.setSelectedCards({ cards: selectedCards }));
    }
  }, [selectArea, activeTabCardsDimensions, activeTabPosition, activeTabScale, isMouseDown]);

  return {
    selectStyle,
  };
};

export const useCardsHooks = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(state => state.project.present.activeViewId || '');
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);
  const cardCollection = useSelector(state => state.project.present.cards);
  const [ cardAnimation, setCardAnimation ] = useState({});

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
    cardArgs,
    cardDropHandler: (event) => {
      event.preventDefault();
      const droppedCard = event.dataTransfer.getData('text');
      if (cardCollection[droppedCard]) {
        if (!cardCollection[droppedCard].views[activeTab]) {
          let x = Math.round((event.clientX - activeTabPosition.x) / GRID_SIZE) * GRID_SIZE;
          let y = Math.round((event.clientY - activeTabPosition.y) / GRID_SIZE) * GRID_SIZE;
          dispatch(actions.project.linkCardToView({
            id: droppedCard,
            position: { x, y }
          }));
        }
      } else {
        setCardAnimation({
          ...cardAnimation,
          [droppedCard]: ANIMATION.cardBlink,
        });
      }
    }
  };
};
