import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './LibCard.scss';
import * as actions from '../../../store/actionIndex';
import { GRID } from '../../../shared/constants/grid';
import LibCardTitleBar from './LibCardTitleBar/LibCardTitleBar';
import LibCardBody from './LibCardBody/LibCardBody';

const LibCard = React.memo(props => {
  const dispatch = useDispatch();

  // VARIABLES
  const [isSelected, setIsSelected] = useState(false);
  const [editingCard, setEditingCard] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTextarea, setEditingTextarea] = useState(false);
  const [existsAlert, setExistsAlert] = useState(false);

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.cardIndex;
  const cardData = cardColl[cardId];
  const cardText = (cardData.data && cardData.data.text) ? cardData.data.text : "loading...";
  const cardLibId = cardId + ".libCard";
  const cardRef = useRef(cardLibId);

  // FUNCTIONS
  const clickHandler = () => {
    if (cardId !== activeCard) {dispatch(actions.updActiveCard(cardId))}
    if (!isSelected) {setIsSelected(true)}
  };
  
  const outsideClickHandler = () => {
    if (cardId === activeCard && isSelected) {
      dispatch(actions.updActiveCard(null));
      setIsSelected(false);
    }
  };
  useOutsideClick(cardRef, outsideClickHandler);

  const drag = (event) => {event.dataTransfer.setData("text", event.target.id)};

  const drop = (event) => {
    if (cardColl[cardId].views[activeView]) {
      setExistsAlert(true);
      window.setTimeout(() => setExistsAlert(false), 2000);
    }
  };

  // STYLES
  const cardStyle = {
    border: cardId === activeCard ? '3px solid black' : '1px solid black',
    margin: cardId === activeCard ? '0px' : '2px',
  };

  const existsAlertStyle = {
    visibility: existsAlert ? "visible" : "hidden",
    opacity: existsAlert ? 1 : 0,
  };

  return (
    <div ref={cardRef} id={cardLibId}
      className="libCard" style={cardStyle} 
      draggable onDragStart={(e)=>drag(e)} onDragEnd={(e)=>drop(e)}
      onClick={clickHandler}>
      <LibCardTitleBar id={cardId}
        isSelected={isSelected}
        setEditingCard={setEditingCard}
        editingTitle={editingTitle} setEditingTitle={setEditingTitle}
        setEditingTextarea={setEditingTextarea}
      />
      <LibCardBody id={cardId}
        isSelected={isSelected}
        setEditingCard={setEditingCard}
        editingTextarea={editingTextarea} setEditingTextarea={setEditingTextarea}
      />
    </div>
  );
});

export default LibCard;