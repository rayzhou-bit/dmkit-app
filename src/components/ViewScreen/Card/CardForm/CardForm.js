import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import './CardForm.scss';
import * as actions from '../../../../store/actionIndex';
import { useOutsideClick } from '../../../../shared/utilityFunctions';
import { GRID } from '../../../../shared/constants/grid';
import CardTitle from './CardTitle/CardTitle';
import CardContent from './CardContent/CardContent';

const CardForm = props => {
  const {cardId, cardRef, toolMenuRef, 
    isSelected, setIsSelected, setDragging,
    dragStopHandler, cardClickHandler,
    toFrontStyle, cardStyle,
    onAnimationEnd,
  } = props;
  const dispatch = useDispatch();

  // STATES
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const editingCard = (editingTitle || editingText) ? true : false;

  // STORE SELECTORS
  const activeCardId = useSelector(state => state.campaignData.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const cardPos = useSelector(state => state.campaignData.cards[cardId].views[activeViewId].pos);
  const cardSize = useSelector(state => state.campaignData.cards[cardId].views[activeViewId].size);

  // IDS & REFS
  const titleInputRef = useRef(cardId+".card-title");
  const textInputRef = useRef(cardId+".card-text");
  
  // FUNCTIONS
  const resizeStopHandler = (event, direction, ref, delta, position) => {
    if (delta.width !== 0 || delta.height !== 0) {
      dispatch(actions.updCardSize(cardId, {width: ref.style.width, height: ref.style.height}));
      if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
          dispatch(actions.updCardPos(cardId, {x: position.x, y: position.y}));
      }
    }
  };

  const keyPressTitleHandler = (event) => {
    if (isSelected && editingTitle) {
      if (event.key === 'Enter') {
        endTitleEdit();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        endTitleEdit();
        beginTextEdit();
      }
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {setEditingTitle(false)}
  };

  const beginTextEdit = () => {
    if (!editingText) {
      textInputRef.current.focus();
      textInputRef.current.setSelectionRange(textInputRef.current.value.length, textInputRef.current.value.length);
      setEditingText(true);
    }
  };

  useOutsideClick([cardRef, toolMenuRef], isSelected, 
    () => {
      if (cardId === activeCardId) {dispatch(actions.updActiveCardId(null))}
      setIsSelected(false);
    }
  );
  
  return (
    <Rnd style={toFrontStyle}
      bounds="parent"
      // position
      position={cardPos}
      // drag
      disableDragging={editingCard}
      dragHandleClassName="title-container"
      dragGrid={[GRID.size, GRID.size]}
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={cardSize}
      minWidth={GRID.size*5} minHeight={GRID.size*4}
      // resize
      resizeGrid={[GRID.size, GRID.size]}
      onResizeStop={resizeStopHandler}
    >
      <div ref={cardRef} className="card" style={cardStyle}
        onClick={cardClickHandler}
        onAnimationEnd={onAnimationEnd}>
        <CardTitle cardId={cardId} titleInputRef={titleInputRef} toolMenuRef={toolMenuRef}
          isSelected={isSelected} editingTitle={editingTitle} setEditingTitle={setEditingTitle} editingCard={editingCard}
          keyPressTitleHandler={keyPressTitleHandler} endTitleEdit={endTitleEdit} />
        <CardContent cardId={cardId} textInputRef={textInputRef} toolMenuRef={toolMenuRef}
          isSelected={isSelected} editingText={editingText} setEditingText={setEditingText} editingCard={editingCard}
          beginTextEdit={beginTextEdit} />
      </div>
    </Rnd>
  );
};

export default CardForm;