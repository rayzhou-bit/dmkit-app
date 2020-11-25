import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './LibCard.scss';
import * as actions from '../../../store/actionIndex';
import LibCardTitleBar from './LibCardTitleBar/LibCardTitleBar';
import LibCardBody from './LibCardBody/LibCardBody';

import DeleteButton from '../../../media/icons/delete.svg';

const LibCard = React.memo(props => {
  const dispatch = useDispatch();

  // VARIABLES
  const [isSelected, setIsSelected] = useState(false);
  const [editingCard, setEditingCard] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTextarea, setEditingTextarea] = useState(false);

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.cardIndex;
  const cardData = cardColl[cardId];
  const cardColor = cardData.views[activeView] ? cardData.views[activeView].color : "gray";
  const cardRef = useRef(cardId+"libCard");

  // FUNCTIONS
  const clickHandler = () => {
    if (cardId !== activeCard) {dispatch(actions.updActiveCard(cardId))}
    if (!isSelected) {setIsSelected(true)}
  };
  
  const outsideClickHandler = () => {
    if (cardId === activeCard && isSelected) {
      dispatch(actions.updActiveCard(null));
    }
  };
  useOutsideClick(cardRef, outsideClickHandler);

  // STYLES
  const cardStyle = {
    backgroundColor: cardColor,
    border: cardId === activeCard ? '3px solid black' : '1px solid black',
    margin: cardId === activeCard ? '0px' : '2px',
  };


  return (
    <div ref={cardRef} className="libCard" 
      style={cardStyle} 
      onClick={clickHandler}>
      <LibCardTitleBar id={cardId}
        setEditingCard={setEditingCard}
        editingTitle={editingTitle} setEditingTitle={setEditingTitle}
        setEditingTextarea={setEditingTextarea}
      />
      <LibCardBody id={cardId}
        setEditingCard={setEditingCard}
        editingTextarea={editingTextarea} setEditingTextarea={setEditingTextarea}
      />
    </div>
  );
});

export default LibCard;