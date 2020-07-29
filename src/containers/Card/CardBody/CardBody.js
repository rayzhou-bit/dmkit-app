import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./CardBody.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";

const CardBody = (props) => {
  const dispatch = useDispatch();
  
  const setEditingCard = props.setEditingCard;
  const [editingTextarea, setEditingTextarea] = useState(false);

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardText = (cardData.data && cardData.data.text) ? cardData.data.text : "";
  const cardTextRef = useRef(cardId+"text");

  const enterDataHandler = (event) => {
    if (event.which === 13) {
      dispatch(actions.updCardText(cardId, cardTextRef.current.value));
      setEditingTextarea(false);
      setEditingCard(false);
    }
  };
  
  const outsideClickFunc = () => {
    dispatch(actions.updCardText(cardId, cardTextRef.current.value));
    setEditingTextarea(false);
    setEditingCard(false);
  };
  useOutsideClick(cardTextRef, editingTextarea, outsideClickFunc);

  return (
    <div className="body">
      <textarea
        ref={cardTextRef}
        className="textfield"
        onDoubleClick={() => {setEditingTextarea(true); setEditingCard(true)}}
        onKeyUp={editingTextarea ? (event) => enterDataHandler(event) : null}
        defaultValue={cardText}
        readOnly={!editingTextarea}
        type="text"
      />
    </div>
  );
};

export default CardBody;
