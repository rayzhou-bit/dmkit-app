import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useOutsideClick } from '../../shared/utils';
import { CARD, GRID } from '../../shared/_dimensions';

import * as actions from '../../store/actionIndex';

export const useCardHooks = ({
  cardAnimation,
  cardId,
  setCardAnimation,
  toolMenuRef,
}) => {
  const dispatch = useDispatch();

  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(false);
  const [blink, setBlink] = useState(false);
  const [showDropdownColor, setShowDropdownColor] = useState(false);
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);

  const cardRef = useRef();
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const activeViewScale = useSelector(state => activeViewId ? state.campaignData.present.views[activeViewId].scale : null);
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardPos = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].pos);
  const cardSize = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].size);

  useOutsideClick([cardRef, toolMenuRef], selected, 
    () => {
      if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
      setSelected(false);
    }
  );

  let rndZ = 100*cardPos.y + cardPos.x + 10;
  if (dragging) {
    rndZ = 20000*(cardPos.y + cardPos.x + 10);
  } else if (cardId === activeCardId) {
    rndZ = 10000*(cardPos.y + cardPos.x + 10);
  }

  return {
    cardConfig: {
      className: "card" +
        ((cardId === activeCardId) ? " active-card" : "") + 
        (blink ? " blink-card" : ""),
      onAnimationEnd: () => {
        setCardAnimation({...cardAnimation, [cardId]: null});
        setBlink(false);
      },
      onClick: () => {
        if (!selected) {
          if (cardId !== activeCardId) dispatch(actions.updActiveCardId(cardId));
          setSelected(true);
        }
      },
      ref: cardRef,
      style: {
        animation: cardAnimation ? cardAnimation[cardId] : null,
        backgroundColor: cardColor,
      },
    },
    rndConfig: {
      bounds: "parent",
      disableDragging: editing,
      dragHandleClassName: "title",
      enableResizing: true,
      minHeight: CARD.minHeight,
      minWidth: CARD.minWidth,
      onDragStart: () => setDragging(true),
      onDragStop: (event, data) => {
        setDragging(false);
        if (cardPos) {
          if (cardPos.x !== data.x || cardPos.y !== data.y) {
            dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
          }
        } else {
          dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
        }
      },
      onResizeStop: (event, direction, ref, delta, position) => {
        if (delta.width !== 0 || delta.height !== 0) {
          dispatch(actions.updCardSize(cardId, {width: ref.style.width, height: ref.style.height}));
          if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
              dispatch(actions.updCardPos(cardId, {x: position.x, y: position.y}));
          }
        }
      },
      position: cardPos,
      resizeGrid: [GRID.size, GRID.size],
      scale: activeViewScale,
      size: cardSize,
      style: { zIndex: rndZ },
    },
    setEditingCard: setEditing,
  };
};