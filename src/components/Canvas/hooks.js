import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { actions, selectors } from '../../data/redux';
import * as api from '../../data/api/database';

import { NETWORK_STATUS, CANVAS_STATES } from '../../constants/states';
import {
  GRID_SIZE,
  CANVAS_SIZE,
  DEFAULT_CANVAS_POSITION,
  DEFAULT_CANVAS_SCALE,
  MAX_CANVAS_SCALE,
  MIN_CANVAS_SCALE,
  ZOOM_STEP,
  WHEEL_PAN_SPEED,
  WHEEL_GESTURE_END_MS,
} from '../../constants/dimensions';
import { ANIMATION } from '../Card/hooks';
import {
  normalizeWheelDelta,
  zoomAtPoint,
  getWheelScale,
  applyTransform,
  clampPosition,
  getViewportPoint,
} from '../../utils/canvasTransform';
import { isTextEntryTarget, isSpaceActivatedTarget } from '../../utils/focusUtils';

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

export const useCanvasHooks = ({ containerRef, canvasRef }) => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.userId);
  const status = useSelector(state => state.session.status || NETWORK_STATUS.idle);
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const activeTab = useSelector(state => state.project.present.activeViewId || '');
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);
  const activeTabScale = useSelector(selectors.project.activeTabScale);
  const popupType = useSelector(state => state.session.popup?.type);

  const [ canvasState, setCanvasState ] = useState(CANVAS_STATES.empty);
  const [ isPanning, setIsPanning ] = useState(false);
  const [ isPanModifierHeld, setIsPanModifierHeld ] = useState(false);
  const [ displayScale, setDisplayScale ] = useState(activeTabScale ?? DEFAULT_CANVAS_SCALE);

  const panModifierRef = useRef(false);
  const liveTransformRef = useRef({
    position: activeTabPosition ?? DEFAULT_CANVAS_POSITION,
    scale: activeTabScale ?? DEFAULT_CANVAS_SCALE,
    animate: false,
  });
  const reduxTransformRef = useRef({
    position: activeTabPosition ?? DEFAULT_CANVAS_POSITION,
    scale: activeTabScale ?? DEFAULT_CANVAS_SCALE,
  });
  const gestureRef = useRef({ type: null, startX: 0, startY: 0, startPosition: null });
  const rafRef = useRef(null);
  const wheelSettleRef = useRef(null);

  const isInteractive = canvasState === CANVAS_STATES.loaded && !popupType;

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

  // Keeps the canvas from being panned/zoomed entirely out of view - see
  // clampPosition in canvasTransform.js.
  const clampToViewport = (position, scale) => {
    const node = containerRef.current;
    const rect = node ? node.getBoundingClientRect() : { width: 0, height: 0 };
    return clampPosition({
      position,
      scale,
      viewportWidth: rect.width,
      viewportHeight: rect.height,
      contentWidth: CANVAS_SIZE.width,
      contentHeight: CANVAS_SIZE.height,
    });
  };

  const scheduleApply = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyTransform(canvasRef.current, liveTransformRef.current);
      const rounded = Math.round(liveTransformRef.current.scale * 100);
      setDisplayScale(prev => Math.round(prev * 100) === rounded ? prev : liveTransformRef.current.scale);
    });
  };

  const flushApply = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    applyTransform(canvasRef.current, liveTransformRef.current);
    const rounded = Math.round(liveTransformRef.current.scale * 100);
    setDisplayScale(prev => Math.round(prev * 100) === rounded ? prev : liveTransformRef.current.scale);
  };

  const commitTransform = () => {
    const live = liveTransformRef.current;
    const committed = reduxTransformRef.current;
    const positionChanged = live.position.x !== committed.position.x || live.position.y !== committed.position.y;
    const scaleChanged = live.scale !== committed.scale;
    if (positionChanged) dispatch(actions.project.setActiveTabPosition({ position: live.position }));
    if (scaleChanged) dispatch(actions.project.setActiveTabScale({ scale: live.scale }));
    if (positionChanged || scaleChanged) {
      reduxTransformRef.current = { position: live.position, scale: live.scale };
    }
  };

  const syncFromRedux = () => {
    const scale = activeTabScale ?? DEFAULT_CANVAS_SCALE;
    const position = clampToViewport(activeTabPosition ?? DEFAULT_CANVAS_POSITION, scale);
    const next = { position, scale };
    liveTransformRef.current = { ...next, animate: false };
    reduxTransformRef.current = next;
  };

  const cancelGesture = () => {
    clearTimeout(wheelSettleRef.current);
    gestureRef.current = { type: null, startX: 0, startY: 0, startPosition: null };
    setIsPanning(false);
    flushApply();
    commitTransform();
  };

  const zoomByStep = (delta) => {
    const node = containerRef.current;
    const rect = node ? node.getBoundingClientRect() : { width: 0, height: 0 };
    const anchor = { x: rect.width / 2, y: rect.height / 2 };
    const live = liveTransformRef.current;
    const next = zoomAtPoint({ position: live.position, scale: live.scale, nextScale: live.scale + delta, anchor });
    liveTransformRef.current = { position: clampToViewport(next.position, next.scale), scale: next.scale, animate: true };
    flushApply();
    commitTransform();
  };

  const zoomIn = () => zoomByStep(ZOOM_STEP);
  const zoomOut = () => zoomByStep(-ZOOM_STEP);

  const resetView = () => {
    liveTransformRef.current = {
      position: clampToViewport(DEFAULT_CANVAS_POSITION, DEFAULT_CANVAS_SCALE),
      scale: DEFAULT_CANVAS_SCALE,
      animate: true,
    };
    flushApply();
    commitTransform();
  };

  // Layout writer — re-applies the live transform after every render, so an
  // unrelated re-render never reverts the canvas to a stale value.
  useLayoutEffect(() => {
    applyTransform(canvasRef.current, liveTransformRef.current);
  });

  // Redux -> live sync, runs when Redux's committed transform changes and no gesture is active.
  useEffect(() => {
    if (!gestureRef.current.type) {
      syncFromRedux();
      scheduleApply();
    }
  }, [activeTabPosition, activeTabScale]);

  // Tab-change resync — abandon any in-flight gesture and resync when the active
  // tab changes. This deliberately does NOT call cancelGesture()/commitTransform():
  // by the time this effect runs, activeViewId has already switched to the new
  // tab (the render already happened), so setActiveTabPosition/setActiveTabScale
  // would write the OLD tab's leftover live transform into the NEW tab's stored
  // position/scale (both reducers target state.views[state.activeViewId], not a
  // tab id in the payload). Dropping an uncommitted delta for the tab you just
  // navigated away from is safe; committing it to the wrong tab is not.
  useEffect(() => {
    clearTimeout(wheelSettleRef.current);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    gestureRef.current = { type: null, startX: 0, startY: 0, startPosition: null };
    setIsPanning(false);
    syncFromRedux();
    scheduleApply();
  }, [activeTab]);

  // Native wheel listener.
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !isInteractive) return;

    const onWheel = (event) => {
      // Same rule as the drag-pan guard below: let the active/selected card
      // handle its own scroll (e.g. a long text field), but wheel-pan the
      // canvas as normal over any other card's text, since it's not being
      // interacted with.
      if (event.target.closest && event.target.closest('.active-card')) return;
      event.preventDefault();
      if (gestureRef.current.type === 'drag') return;
      gestureRef.current.type = 'wheel';

      const rect = node.getBoundingClientRect();
      let { dx, dy } = normalizeWheelDelta(event, rect.height);
      const live = liveTransformRef.current;

      if (event.ctrlKey || event.metaKey) {
        const anchor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        const next = zoomAtPoint({ position: live.position, scale: live.scale, nextScale: getWheelScale(live.scale, dy), anchor });
        liveTransformRef.current = { position: clampToViewport(next.position, next.scale), scale: next.scale, animate: false };
      } else {
        if (event.shiftKey && dx === 0) { dx = dy; dy = 0; }
        const nextPosition = { x: live.position.x - dx * WHEEL_PAN_SPEED, y: live.position.y - dy * WHEEL_PAN_SPEED };
        liveTransformRef.current = {
          ...live,
          animate: false,
          position: clampToViewport(nextPosition, live.scale),
        };
      }
      scheduleApply();
      clearTimeout(wheelSettleRef.current);
      wheelSettleRef.current = setTimeout(() => {
        gestureRef.current.type = null;
        flushApply();
        commitTransform();
      }, WHEEL_GESTURE_END_MS);
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [containerRef.current, isInteractive]);

  // Native capture-phase mousedown listener for pan-drag (middle-click always;
  // left-click only while space is held).
  useEffect(() => {
    const node = containerRef.current;
    if (!node || !isInteractive) return;

    const onPanMove = (event) => {
      const g = gestureRef.current;
      if (g.type !== 'drag') return;
      const nextPosition = {
        x: g.startPosition.x + (event.clientX - g.startX),
        y: g.startPosition.y + (event.clientY - g.startY),
      };
      liveTransformRef.current = {
        ...liveTransformRef.current,
        animate: false,
        position: clampToViewport(nextPosition, liveTransformRef.current.scale),
      };
      scheduleApply();
    };

    const onPanEnd = () => {
      window.removeEventListener('mousemove', onPanMove);
      window.removeEventListener('mouseup', onPanEnd);
      gestureRef.current.type = null;
      setIsPanning(false);
      flushApply();
      commitTransform();
    };

    const onPanMouseDown = (event) => {
      const isMiddle = event.button === 1;
      const isSpaceLeft = event.button === 0 && panModifierRef.current;
      if (!isMiddle && !isSpaceLeft) return;
      // Don't hijack a drag that starts anywhere on the currently active/
      // selected card - Card.jsx applies the `active-card` class to the
      // whole card (title, content, everywhere) as soon as it's clicked,
      // so this covers the whole surface, not just a specific sub-element.
      // Let normal interaction (text selection, cursor placement, react-rnd's
      // own drag) happen there instead. Panning is still fine over any
      // OTHER card.
      if (event.target.closest && event.target.closest('.active-card')) return;
      event.preventDefault();
      event.stopPropagation();
      gestureRef.current = {
        type: 'drag',
        startX: event.clientX,
        startY: event.clientY,
        startPosition: { ...liveTransformRef.current.position },
      };
      setIsPanning(true);
      window.addEventListener('mousemove', onPanMove);
      window.addEventListener('mouseup', onPanEnd);
    };

    node.addEventListener('mousedown', onPanMouseDown, true);
    return () => {
      node.removeEventListener('mousedown', onPanMouseDown, true);
      window.removeEventListener('mousemove', onPanMove);
      window.removeEventListener('mouseup', onPanEnd);
    };
  }, [containerRef.current, isInteractive]);

  // Keyboard listener — space-to-pan-modifier and Cmd/Ctrl+0/+/- zoom shortcuts.
  useEffect(() => {
    if (!isInteractive) return;

    const onKeyDown = (event) => {
      if (event.code === 'Space' || event.key === ' ') {
        if (event.repeat) return;
        if (isTextEntryTarget(event.target) || isSpaceActivatedTarget(event.target)) return;
        event.preventDefault();
        if (!panModifierRef.current) {
          panModifierRef.current = true;
          setIsPanModifierHeld(true);
        }
        return;
      }
      if ((event.metaKey || event.ctrlKey) && !event.altKey) {
        if (event.key === '0' || event.code === 'Digit0' || event.code === 'Numpad0') {
          event.preventDefault();
          resetView();
        } else if (event.key === '=' || event.key === '+' || event.code === 'Equal' || event.code === 'NumpadAdd') {
          event.preventDefault();
          zoomByStep(ZOOM_STEP);
        } else if (event.key === '-' || event.key === '_' || event.code === 'Minus' || event.code === 'NumpadSubtract') {
          event.preventDefault();
          zoomByStep(-ZOOM_STEP);
        }
      }
    };

    const releaseSpace = () => {
      if (panModifierRef.current) {
        panModifierRef.current = false;
        setIsPanModifierHeld(false);
      }
    };

    const onKeyUp = (event) => {
      if (event.code === 'Space' || event.key === ' ') releaseSpace();
    };

    const onBlur = () => { releaseSpace(); cancelGesture(); };
    const onVisibilityChange = () => { if (document.hidden) { releaseSpace(); cancelGesture(); } };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isInteractive]);

  return {
    canvasState,
    isPanning,
    isPanModifierHeld,
    panModifierRef,
    displayScale,
    zoomIn,
    zoomOut,
    resetView,
    canZoomIn: displayScale < MAX_CANVAS_SCALE,
    canZoomOut: displayScale > MIN_CANVAS_SCALE,
    createNewProject: () => dispatch(api.createAndSwitchToEmptyProject()),
  };
};


export const useMultiSelectHooks = ({
  containerRef,
  canvasRef,
  selectRef,
  panModifierRef,
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

  // World-space point under the event: first make it relative to the
  // container's own top-left (getViewportPoint), THEN undo the canvas's
  // pan/scale. Using raw event.clientX/Y directly only worked by accident of
  // the container currently sitting at viewport (0,0).
  const toWorldPoint = (event) => {
    const point = getViewportPoint(event, containerRef.current);
    return {
      x: (point.x - activeTabPosition.x) / activeTabScale,
      y: (point.y - activeTabPosition.y) / activeTabScale,
    };
  };

  const updateSelect = (event) => {
    setSelectArea(prev => ({ ...prev, end: toWorldPoint(event) }));
  };

  const canvasMouseDownHandler = (event) => {
    if (panModifierRef && panModifierRef.current) return;
    if (event.button === 0) {
      setIsMouseDown(true);
      // TODO The following line refers to a specific className. Probably not the best to implement this way.
      if (canvasRef.current && event.target.classList.contains('canvas')) {
        document.addEventListener('mousemove', updateSelect);
        const start = toWorldPoint(event);
        setSelectArea({ start, end: start });
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

export const useCardsHooks = ({ containerRef } = {}) => {
  const dispatch = useDispatch();
  const activeTab = useSelector(state => state.project.present.activeViewId || '');
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);
  const activeTabScale = useSelector(selectors.project.activeTabScale) ?? 1;
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
          // Container-relative first (getViewportPoint), then undo pan/scale
          // to get world coordinates - matches useMultiSelectHooks. The old
          // math skipped the scale divide entirely, so drops landed in the
          // wrong spot at any zoom level other than 100%.
          const point = getViewportPoint(event, containerRef?.current);
          let x = Math.round((point.x - activeTabPosition.x) / activeTabScale / GRID_SIZE) * GRID_SIZE;
          let y = Math.round((point.y - activeTabPosition.y) / activeTabScale / GRID_SIZE) * GRID_SIZE;
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
