import React, { useState, useEffect } from "react";

import { CARD_FONT_SIZE } from "../../../shared/constants/fontSize";

// Creates a title text with an edit button
// css is fully controlled by props

const ContentTextarea = ({
  className,
  styles,
  isSelected,
  lib = false,
  value,
  saveValue,
  setEditingParent,
}) => {
  const [textareaValue, setTextareaValue] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTextareaValue(value);
  }, [setTextareaValue, value]);

  const beginEdit = (event) => {
    if (!editing) {
      setEditing(true);
      if (setEditingParent) {
        setEditingParent(true);
      }
    }
  };

  const endEdit = (event) => {
    if (editing) {
      document.getSelection().removeAllRanges();
      if (textareaValue !== value) {
        saveValue(textareaValue);
      }
      setEditing(false);
      if (setEditingParent) {
        setEditingParent(false);
      }
    }
  };

  const keyPressHandler = (event) => {
    if (editing) {
      if (event.key === "Tab") {
        event.preventDefault();
        // TODO make tab indent. need to set cursor position after value state update
        // const { selectionStart, selectionEnd } = event.target;
        // const val = event.target.value;
        // const newValue = val.substring(0, selectionStart) + '\t' + val.substring(selectionEnd);
        // event.target.setSelectionRange(0,0);
        // setTextareaValue(newValue);
      }
    }
  };

  //slice content
  //if text content is greater than 300 char
  //slice + ...
  const slice =
    textareaValue.length > 300 && lib
      ? textareaValue.slice(0, 300) + "..."
      : textareaValue;

  return (
    <textarea
      className={className}
      onBlur={endEdit}
      onChange={(e) => setTextareaValue(e.target.value)}
      onClick={beginEdit}
      onDragOver={(e) => e.preventDefault()}
      onKeyDown={keyPressHandler}
      onWheel={(e) => e.stopPropagation()}
      placeholder="Fill me in!"
      readOnly={!editing}
      style={styles}
      type="text"
      value={textareaValue ? (isSelected ? textareaValue : slice) : ""}
    />
  );
};

export default ContentTextarea;
