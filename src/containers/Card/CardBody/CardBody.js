import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./CardBody.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";

const CardBody = (props) => {
  const dispatch = useDispatch();
  
  // VARIABLES
  const setEditingCard = props.setEditingCard;
  const [editingTextarea, setEditingTextarea] = [props.editingTextarea, props.setEditingTextarea];

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardText = (cardData.data && cardData.data.text) ? cardData.data.text : "";
  const cardTextId = cardId+"Textarea";
  const cardTextRef = useRef(cardTextId);

  // FUNCTIONS
  const beginEdit = () => {
    if (!editingTextarea) {
      const text = document.getElementById(cardTextId);
      text.focus();
      text.setSelectionRange(text.value.length, text.value.length);
      setEditingTextarea(true);
      setEditingCard(true);
    }
  };

  const endEdit = () => {
    if (editingTextarea) {
      dispatch(actions.updCardText(cardId, cardTextRef.current.value));
      setEditingTextarea(false);
      setEditingCard(false);
    }
  };

  const keyPressHandler = (event) => {
    if (cardId === activeCard) {
      if (event.key === 'Tab') {
        event.preventDefault();
        endEdit();
      }
    }
  };
  
  useOutsideClick(cardTextRef, editingTextarea, endEdit);

  // STYLES
  const bodyStyle = {
    backgroundColor: editingTextarea ? "white" : "lightgray",
    userSelect: "none",
  };

  return (
    <div className="body">
      <textarea ref={cardTextRef} id={cardTextId}
        className="textfield" style={bodyStyle} type="text"
        defaultValue={cardText}
        readOnly={!editingTextarea}
        onClick={(cardId === activeCard) ? beginEdit : null}
        onDoubleClick={(cardId !== activeCard) ? beginEdit : null}
        onKeyDown={(e) => keyPressHandler(e)}
      />
    </div>
  );
};

export default CardBody;
