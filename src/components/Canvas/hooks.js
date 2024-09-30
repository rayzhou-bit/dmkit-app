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

const checkCardInSelection = (selectArea, cardArea, offset) => {
  const {start, end} = selectArea;
  const {pos, size} = cardArea;
  const {x, y} = offset;
  if (!start || !end || !pos || !size || !x || !y) {
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
  if (pos.x + x + size.width < leftBound || pos.x + x > rightBound) {
    return false;
  }
  // check if card is top or bottom of bounds
  if (pos.y + y + size.height < topBound || pos.y + y > bottomBound) {
    return false;
  }
  return true;
};

const adjustPositionForScale = (x, y, scale) => {
  return {
    x: x * scale,
    y: y * scale,
  };
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
    // Panning
    // event.stopPropagation();
    // event.preventDefault();
    if (event.button == 1) {
      setIsPanning(true);
      setStartPan({
        x: event.clientX - activeTabPosition.x,
        y: event.clientY - activeTabPosition.y,
      });
    }
  };

  const endPanning = () => {
    // Panning
    setIsPanning(false);
  };

  const mouseMoveHandler = (event) => {
    // Panning
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
    mouseMoveHandler,
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
  const [ temp, setTemp ] = useState([]);

  const updateSelect = (event) => {
    setSelectArea(prev => ({
      ...prev,
      end: {
        x: event.clientX,
        y: event.clientY,
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
            x: event.clientX,
            y: event.clientY,
          },
          end: {
            x: event.clientX,
            y: event.clientY,
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
  }, [canvasRef.current]);

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
          left = `${(start.x - activeTabPosition.x)}px`;
          width = `${(end.x - start.x)}px`;
        } else  {
          left = `${(end.x - activeTabPosition.x)}px`;
          width = `${(start.x - end.x)}px`;
        }
        if (end.y > start.y) {
          top = `${(start.y - activeTabPosition.y)}px`;
          height = `${(end.y - start.y)}px`;
        } else {
          top = `${(end.y - activeTabPosition.y)}px`;
          height = `${(start.y - end.y)}px`;
        }
        console.log(`scale: ${activeTabScale}\n
          result: ${left}, ${top}\n
          start: ${start.x}, ${start.y}\n
          tabPosition: ${activeTabPosition.x}, ${activeTabPosition.y}\n
          calculation: ${start.x - (activeTabPosition.x / activeTabScale)}
          `)
        setSelectStyle({ left, top, width, height, border });
      } else {
        setSelectStyle({ border: null });
      }
    }
  }, [selectArea, activeTabPosition, selectRef.current])

  // update selected cards when selection area state changes
  useEffect(() => {
    let selectedCards = [];
    for (let cardId in activeTabCardsDimensions) {
      if (checkCardInSelection(selectArea, activeTabCardsDimensions[cardId], activeTabPosition)) {
        selectedCards.push(cardId);
      }
    }
    if (isMouseDown) {
      dispatch(actions.session.setSelectedCards({ cards: selectedCards }));
    }
  }, [selectArea, activeTabCardsDimensions, activeTabPosition, isMouseDown]);

  return {
    selectStyle,
  };
};


// const setStyle = (el, selectArea) => {
//   console.log(el.style)
//   const {start, end} = selectArea;
//   const border = `1px solid black`;
//   if (start && end) {
//     el.style.border = border;
//     if (end.x > start.x) {
//       el.style.left = `${start.x}px`;
//       el.style.width = `${end.x - start.x}px`;
//     } else  {
//       el.style.left = `${end.x}px`;
//       el.style.width = `${start.x - end.x}px`;
//     }
//     if (end.y > start.y) {
//       el.style.top = `${start.y}px`;
//       el.style.height = `${end.y - start.y}px`;
//     } else {
//       el.style.top = `${end.y}px`;
//       el.style.height = `${start.y - end.y}px`;
//     }
//   } else {
//     el.style.border = `null`;
//   }
// };

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