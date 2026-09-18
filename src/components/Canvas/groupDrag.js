// Ref-backed external store for group drag: while one selected card (the
// "leader") is dragged, every other selected card ("follower") tracks the
// same delta live, without going through Redux until the drag commits.
// Deliberately has no import from Canvas/hooks.js or Card/hooks.js.
import { useRef, useSyncExternalStore } from 'react';
import { GRID_SIZE, CANVAS_SIZE } from '../../constants/dimensions';

export const clampGroupDelta = ({ delta, origins, canvasSize }) => {
  const ids = Object.keys(origins);
  if (ids.length === 0) return { x: 0, y: 0 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of ids) {
    const { pos, size } = origins[id];
    const width = parseFloat(size.width);
    const height = parseFloat(size.height);
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + width);
    maxY = Math.max(maxY, pos.y + height);
  }

  // Clamp the bounding box as a whole (not each card), so relative
  // positions within the group are preserved exactly.
  const maxAllowedX = Math.max(0, canvasSize.width - (maxX - minX));
  const maxAllowedY = Math.max(0, canvasSize.height - (maxY - minY));
  const newMinX = Math.min(Math.max(minX + delta.x, 0), maxAllowedX);
  const newMinY = Math.min(Math.max(minY + delta.y, 0), maxAllowedY);

  return {
    x: Math.round((newMinX - minX) / GRID_SIZE) * GRID_SIZE,
    y: Math.round((newMinY - minY) / GRID_SIZE) * GRID_SIZE,
  };
};

const createGroupDragStore = () => {
  let leaderId = null;
  let memberIds = null;
  let origins = null;
  let currentDelta = { x: 0, y: 0 };
  // Positions rendered to followers - only rebuilt once per rAF flush, so
  // useSyncExternalStore sees a stable reference between emits.
  let positions = null;
  let rafId = null;
  const listeners = new Set();
  // Owned by the store, written each render by useCardsHooks - lets
  // start({ leaderId }) read the current selection without Card/hooks.js
  // having to look it up itself.
  const selectionRef = { current: { selectedCards: [], cardsDimensions: {} } };

  const emit = () => listeners.forEach((fn) => fn());

  const recomputePositions = () => {
    const next = {};
    for (const id of memberIds) {
      if (id === leaderId) continue;
      const origin = origins[id];
      if (!origin) continue;
      next[id] = { x: origin.pos.x + currentDelta.x, y: origin.pos.y + currentDelta.y };
    }
    positions = next;
  };

  const scheduleEmit = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      recomputePositions();
      emit();
    });
  };

  const start = ({ leaderId: newLeaderId }) => {
    const { selectedCards, cardsDimensions } = selectionRef.current;
    leaderId = newLeaderId;
    memberIds = selectedCards;
    origins = {};
    for (const id of selectedCards) {
      if (cardsDimensions[id]) origins[id] = cardsDimensions[id];
    }
    currentDelta = { x: 0, y: 0 };
    positions = null;
  };

  const move = ({ x, y }) => {
    if (!leaderId) return;
    const leaderOrigin = origins[leaderId];
    if (!leaderOrigin) return;
    currentDelta = { x: x - leaderOrigin.pos.x, y: y - leaderOrigin.pos.y };
    scheduleEmit();
  };

  const end = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    leaderId = null;
    memberIds = null;
    origins = null;
    currentDelta = { x: 0, y: 0 };
    positions = null;
    emit();
  };

  const isActive = () => !!leaderId;

  const getCardPosition = (cardId) => positions?.[cardId] ?? null;

  const getCommitDelta = () => {
    if (!leaderId) return { x: 0, y: 0 };
    return clampGroupDelta({ delta: currentDelta, origins, canvasSize: CANVAS_SIZE });
  };

  return {
    selectionRef,
    subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    getCardPosition,
    start,
    move,
    end,
    isActive,
    getCommitDelta,
  };
};

export const useGroupDragStore = () => {
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = createGroupDragStore();
  return storeRef.current;
};

export const useGroupDragPosition = (store, cardId) =>
  useSyncExternalStore(store.subscribe, () => store.getCardPosition(cardId));
