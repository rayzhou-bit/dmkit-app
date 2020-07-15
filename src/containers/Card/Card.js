import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Draggable from "react-draggable";

import * as actions from "../../store/actionIndex";
import "./Card.scss";

const useOutsideClickSave = (ref, card, editing, setEditting) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && editing) {
        dispatch(actions.updCardText(card, ref.current.value));
        setEditting(false);
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [ref, editing]);
};

const Card = (props) => {

  const dispatch = useDispatch();
  
  const [editing, setEditting] = useState(false);

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardPos = cardData.views[activeView];
  const cardTitle = (cardData.data && cardData.data.title) ? cardData.data.title : (cardId + " | " + cardPos.x + " | " + cardPos.y)
  const cardText = (cardData.data && cardData.data.text) ? cardData.data.text : "";
  const cardTextRef = useRef(cardId);

  const onDragStop = (e, pos) => dispatch(actions.updCardPos(cardId, activeView, {x: pos.x, y: pos.y}));
  const removeCardFromView = () => dispatch(actions.removeCardFromView(cardId, activeView));
  const onClickCard = (clickedCard) => dispatch(actions.onClickCard(clickedCard));

  const enterDataHandler = (event, card, newText) => {
    if (event.which === 13 && editing) {
      dispatch(actions.updCardText(card, newText));
      setEditting(false);
    }
  };
  
  useOutsideClickSave(cardTextRef, cardId, editing, setEditting);

  return (
    <Draggable
      //grid={[25, 25]}
      bounds="parent"
      handle="header"
      position={cardPos}
      onStop={onDragStop}
    >
      <div className="card" onClick={cardId === activeCard ? null : () => onClickCard(cardId)}>
        <div className="header">
          <header className="title">{cardTitle}</header>
          <button className="headerButton">.</button>
          <button className="headerButton" onClick={removeCardFromView}>X</button>
        </div>
        <div className="body">
          <textarea
            className="text"
            ref={cardTextRef}
            onChange={editing ? null : () => setEditting(true)}
            onKeyUp={
              cardId === activeCard
                ? (event) => enterDataHandler(event, cardId, cardTextRef.current.value)
                : null
            }
            defaultValue={cardText}
            readOnly={cardId !== activeCard}
            type="text"
          />
        </div>
      </div>
    </Draggable>
  );
};

export default Card;
