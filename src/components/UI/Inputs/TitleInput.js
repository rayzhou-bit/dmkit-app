import React, { useState, useRef, useEffect } from 'react';

import { CARD_FONT_SIZE } from '../../../shared/constants/fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../shared/constants/colors';

// Creates a title text with an edit button
// css is fully controlled by props

const TitleInput = ({
  className,
  color,
  saveValue,
  setEditingParent,
  styles,
  type, // type can be card or view
  value,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const inputRef = useRef();

  // FUNCTIONS
  useEffect(() => {
    setInputValue(value);
  }, [setInputValue, value]);

  const beginEdit = (event) => {
    if (!isEditing) {
      setIsEditing(true);
      if (setEditingParent) setEditingParent(true);
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  };

  const endEdit = (event) => {
    if (isEditing) {
      document.getSelection().removeAllRanges();
      if (inputValue !== value) saveValue(inputValue);
      setIsEditing(false);
      if (setEditingParent) setEditingParent(false);
    }
  };

  const keyPressHandler = (event) => {
    if (isEditing) {
      if (event.key === 'Enter' || event.key === 'Tab') endEdit();
    };
  };

  // STYLES
  let inputStyle = styles ? { ...styles.input} : {};
  // apply input type
  if (type === "view") {
    inputStyle = {
      backgroundColor: isEditing ? "lightskyblue" : "transparent",
    }
  }

  return (
    <div className={className}>
      <input
        className={isEditing ? "editing" : null}
        onBlur={endEdit}
        onChange={e => setInputValue(e.target.value)}
        onDoubleClick={beginEdit}
        onDragOver={e => e.preventDefault()}
        onKeyDown={keyPressHandler}
        ref={inputRef}
        size=''
        style={inputStyle}
        type="text" required maxLength="50"
        value={inputValue ? inputValue : ""} title={inputValue} readOnly={!isEditing}
      />
    </div>
  );
};

export default TitleInput;