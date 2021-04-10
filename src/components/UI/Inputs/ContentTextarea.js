import React, { useState, useEffect } from 'react';

import { CARD_FONT_SIZE } from '../../../shared/constants/fontSize';

// Creates a title text with an edit button
// css is fully controlled by props

const ContentTextarea = props => {
  const { 
    className, styles,
    value, saveValue,
    setEditingParent,
  } = props;

  const [textareaValue, setTextareaValue] = useState("");
  const [editing, setEditing] = useState(false);
  
  // const contentContainerCallbackRef = (node) => {
  //   if (!node) return;
  //   if (!textRef.current) return;
  //   const completeTextHeight = textRef.current ? textRef.current.scrollHeight : 1000;
  //   const abridgedTextHeight = CARD_FONT_SIZE.text*5.5;
  //   node.style.height = isSelected
  //     ? completeTextHeight + 'px'
  //     : Math.min(abridgedTextHeight, completeTextHeight) + 'px';
  // };

  useEffect(() => {
    setTextareaValue(value);
  }, [setTextareaValue, value]);

  const beginEdit = (event) => {
    if (!editing) {
      setEditing(true);
      if (setEditingParent) setEditingParent(true);
      event.target.setSelectionRange(event.target.value.length, event.target.value.length);
      // TODO set cursor at mouse position
    }
  };

  const endEdit = (event) => {
    if (editing) {
      document.getSelection().removeAllRanges();
      if (textareaValue !== value) saveValue(textareaValue);
      setEditing(false);
      if (setEditingParent) setEditingParent(false);
    }
  };

  const keyPressHandler = (event) => {
    if (editing) {
      if (event.key === 'Tab') {
        event.preventDefault();
        // TODO make tab indent. need to set cursor position after value state update
        // const { selectionStart, selectionEnd } = event.target;
        // const val = event.target.value;
        // const newValue = val.substring(0, selectionStart) + '\t' + val.substring(selectionEnd);
        // event.target.setSelectionRange(0,0);
        // setTextareaValue(newValue);
      }
    };
  }

  const textareaStyle = {
    ...styles,
    fontSize: CARD_FONT_SIZE.text+'px',
    backgroundColor: editing ? "white" : "lightgray",
  }

  return (
    <textarea className={className} style={textareaStyle}
      type="text"
      value={textareaValue ? textareaValue : ""} readOnly={!editing}
      placeholder="Fill me in!"
      onFocus={beginEdit} 
      onBlur={endEdit}
      onMouseDown={!editing ? e => e.preventDefault() : null} // prevents focus on single click
      onClick={e => e.target.focus()}
      onChange={e => setTextareaValue(e.target.value)}
      onKeyDown={keyPressHandler}
      onDragOver={e => e.preventDefault()}
    />
  );
};

export default ContentTextarea;