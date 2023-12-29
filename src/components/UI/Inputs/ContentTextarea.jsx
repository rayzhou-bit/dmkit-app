import React, { useState, useEffect, useRef } from "react";

import { CARD_FONT_SIZE } from "../../../shared/constants/fontSize";

// TODO delete/change
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
  const [textSlice, setSlice] = useState(textareaValue);
  const textareaRef = useRef(null);

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
  let maxLines = lib && !isSelected ? 4 : 1000;

  useEffect(() => {
    if (textareaRef.current) {
      // const lineHeight = parseFloat(
      //   window.getComputedStyle(textareaRef.current).lineHeight
      // );
      const lineHeight = 20;
      const maxHeight = lineHeight * maxLines;

      // Split the text into words
      const words = textareaValue.split(" ");

      // Estimate line breaks based on word wrapping
      let currentLine = [];
      const lines = [currentLine];
      let currentLineHeight = 20;

      for (const word of words) {
        const wordWidth = word.length * lineHeight; // Estimate word width based on characters
        if (currentLineHeight + wordWidth <= maxHeight) {
          currentLine.push(word);
          currentLineHeight += wordWidth;
        } else {
          currentLine = [word];
          lines.push(currentLine);
          currentLineHeight = wordWidth;
        }
      }

      // Truncate text if it exceeds the maximum height
      if (lines.length > maxLines) {
        lines.splice(maxLines);
      }

      const truncatedText =
        lines.map((line) => line.join(" ")).join(" ") +
        (lib && !isSelected ? "..." : "");

      setSlice(truncatedText);
    }
  }, [textareaValue, maxLines]);

  const slice =
    textareaValue.length > 300 && lib
      ? textareaValue.slice(0, 300) + "..."
      : textareaValue;

  return (
    <textarea
      ref={textareaRef}
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
      value={textareaValue ? (isSelected ? textareaValue : textSlice) : ""}
    />
  );
};

export default ContentTextarea;
