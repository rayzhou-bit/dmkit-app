import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Draggable from "react-draggable";

import * as actions from "../../store/actionIndex";
import "./Card.scss";

const useOutsideClickSave = (ref, user, campaign, cardId, editing, setEditting) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && editing) {
        dispatch(actions.saveCardData(user, campaign, cardId, ref.current.value));
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

  const user = useSelector((state) => state.campaign.user);
  const campaign = useSelector((state) => state.campaign.campaign);
  const cards = useSelector((state) => state.cards.cards);
  const activeCard = useSelector((state) => state.cards.activeCard);
  const activeView = useSelector((state) => state.views.activeView);

  const onDragStop = (e, data) => dispatch(actions.saveCardPos(activeView, props.id, e, data));
  const removeCard = () => dispatch(actions.removeCard(activeView, props.id));
  const onClickCard = (cardId) => dispatch(actions.onClickCard(activeCard, cardId));

  const enterDataHandler = (event, cardId, newData) => {
    if (event.which === 13 && editing) {
      dispatch(actions.saveCardData(cardId, {text: newData}));
      setEditting(false);
    }
  };
  
  const card = cards[props.id];
  const cardRef = useRef(props.id);
  useOutsideClickSave(cardRef, user, campaign, props.id, editing, setEditting);

  let cardPos = {x: card.views[activeView].x, y: card.views[activeView].y};
  let cardText = (card.data && card.data.text) ? card.data.text : "";

  return (
    <Draggable
      //grid={[25, 25]}
      bounds="parent"
      handle="header"
      position={cardPos}
      onStop={onDragStop}
    >
      <div className="card" onClick={props.id === activeCard ? null : () => onClickCard(props.id)}>
        <div className="header">
          <header className="title">{card.title ? card.title : (props.id + " | " + card.views[activeView].x + " | " + card.views[activeView].y)}</header>
          <button className="headerButton">.</button>
          <button className="headerButton" onClick={removeCard}>X</button>
        </div>
        <div className="body">
          <textarea
            className="text"
            ref={cardRef}
            onChange={editing ? null : () => setEditting(true)}
            onKeyUp={
              props.id === activeCard
                ? (event) => enterDataHandler(event, props.id, cardRef.current.value)
                : null
            }
            defaultValue={cardText}
            readOnly={props.id !== activeCard}
            type="text"
          />
        </div>
      </div>
    </Draggable>
  );
};

export default Card;
