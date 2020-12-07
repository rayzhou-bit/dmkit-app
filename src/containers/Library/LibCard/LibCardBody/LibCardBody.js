import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./LibCardBody.scss";
import * as actions from "../../../../store/actionIndex";
import { useOutsideClick } from "../../../../shared/utilityFunctions";

const LibCardBody = React.memo(props => {
  const dispatch = useDispatch();
  
  // VARIABLES
  const isSelected = props.isSelected;
  const setEditingCard = props.setEditingCard;
  const [editingTextarea, setEditingTextarea] = [props.editingTextarea, props.setEditingTextarea];

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardText = (cardData.data && cardData.data.text) ? cardData.data.text : "loading...";
  const cardTextId = cardId+".libTextarea";
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

  const updEdit = () => {
    if (editingTextarea) {dispatch(actions.updCardText(cardId, cardTextRef.current.value))}
  };

  const endEdit = () => {
    if (editingTextarea) {
      dispatch(actions.updCardText(cardId, cardTextRef.current.value));
      setEditingTextarea(false);
      setEditingCard(false);
    }
  };  //updating the state of the cards stops event bubbling...
    // this causes issues with outsideclick for the card component
    // perhaps set one outsideclick event handler in the main???

  const keyPressHandler = (event) => {
    if (cardId === activeCard && isSelected) {
      if (event.key === 'Tab') {
        event.preventDefault();
        endEdit();
      }
    }
  };
  
  useOutsideClick(cardTextRef, endEdit);

  // STYLES
  const fontSize = 18;
  const textBox = document.getElementById(cardTextId);
  let textHeight = textBox ? textBox.scrollHeight : null;
  const bodyStyle = {
    height: isSelected ? textHeight + 'px' : (fontSize+3)*3+10 + 'px',
    overflowY: isSelected ? 'hidden' : 'auto',
    fontSize: fontSize+'px',
    backgroundColor: editingTextarea ? "white" : "lightgray",
    userSelect: "none",
  };

  return (
    <div className="libBody">
      <textarea ref={cardTextRef} id={cardTextId}
        className="libTextfield" style={bodyStyle} 
        type="text"
        value={cardText}
        readOnly={!editingTextarea}
        onClick={(cardId === activeCard && isSelected) ? beginEdit : null}
        onDoubleClick={(cardId !== activeCard && !isSelected) ? beginEdit : null}
        onChange={updEdit}
        onKeyDown={(e) => keyPressHandler(e)}
      />
    </div>
  );
});

export default LibCardBody;
