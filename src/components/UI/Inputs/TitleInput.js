import React, { useState, useRef, useEffect } from 'react';

import { CARD_FONT_SIZE } from '../../../shared/constants/fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../shared/constants/colors';

import EditImg24 from '../../../assets/icons/edit-24.png';
import EditImg32 from '../../../assets/icons/edit-32.png';

// Creates a title text with an edit button
// css is fully controlled by props

const TitleInput = props => {
  const { 
    className, btnClassName, styles,
    type, color, btnSize,   // type can be card or view
    value, saveValue,
    setEditingParent,
  } = props;

  const [inputValue, setInputValue] = useState("");
  const [editing, setEditing] = useState(false);

  const inputRef = useRef();

  // FUNCTIONS
  useEffect(() => {
    setInputValue(value);
  }, [setInputValue, value]);

  const beginEdit = (event) => {
    if (!editing) {
      setEditing(true);
      if (setEditingParent) setEditingParent(true);
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  };

  const endEdit = (event) => {
    if (editing) {
      document.getSelection().removeAllRanges();
      if (inputValue !== value) saveValue(inputValue);
      setEditing(false);
      if (setEditingParent) setEditingParent(false);
    }
  };

  const keyPressHandler = (event) => {
    if (editing) {
      if (event.key === 'Enter' || event.key === 'Tab') endEdit();
    };
  };

  // STYLES
  let inputStyle = styles ? { ...styles.input} : {};
  let btnStyle = styles ? { ...styles.btn } : {};
  let btnImgStyle = styles ? { ...styles.btnImg } : {};
  inputStyle = {
    ...inputStyle,
    userSelect: editing ? "default" : "none",
    MozUserSelect: editing ? "default" : "none",
    WebkitUserSelect: editing ? "default" : "none",
    msUserSelect: editing ? "default" : "none",
  };
  // apply input type
  if (type === "card") {
    inputStyle = {
      ...inputStyle,
      fontSize: CARD_FONT_SIZE.title+'px',
      cursor: editing ? "text" : "move",
    };
  } else if (type === "view") {
    inputStyle = {
      backgroundColor: editing ? "lightskyblue" : "transparent",
    }
  }
  // apply color
  if (color) {
    inputStyle = {
      ...inputStyle,
      color: TEXT_COLOR_WHEN_BACKGROUND_IS[color],
      backgroundColor: editing ? CARD_TITLEBAR_EDIT_COLORS[color] : color,
    };
    btnStyle = {
      ...btnStyle,
      backgroundColor: color,
    };
    btnImgStyle = {
      ...btnImgStyle,
      WebkitFilter: (TEXT_COLOR_WHEN_BACKGROUND_IS[color] === "white") ? 'invert(100%)' : null,
    };
  }

  return (
    <>
      <button className={btnClassName} style={btnStyle}
        onClick={beginEdit}>
        <img style={btnImgStyle} 
          src={(btnSize === 24) ? EditImg24 : EditImg32} alt="Edit" draggable="false" />
        <span className="tooltip">Edit title</span>
      </button>
      <input ref={inputRef} className={className} style={inputStyle}
        type="text" required maxLength="50"
        value={inputValue ? inputValue : ""} title={inputValue} readOnly={!editing}
        onBlur={endEdit}
        onDoubleClick={beginEdit}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={keyPressHandler}
        onDragOver={e => e.preventDefault()}
      />
    </>
  );
};

export default TitleInput;