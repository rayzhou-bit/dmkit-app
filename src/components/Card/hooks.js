import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useOutsideClick } from '../../shared/utils';
import { CARD, GRID } from '../../shared/_dimensions';
import { BG_COLORS, CARD_FONT_SIZE, TEXT_COLOR } from '../../shared/_styles';

import * as actions from '../../store/actionIndex';

export const useCardHooks = ({
  cardAnimation,
  cardId,
  setCardAnimation,
  toolMenuRef, 
}) => {
  const dispatch = useDispatch();

  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(false);
  const [blink, setBlink] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [editingContent, setEditingContent] = useState(false);
  const [contentTextValue, setContentTextValue] = useState("");
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showMenuDropdown, setMenuShowDropdown] = useState(false);

  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const activeViewScale = useSelector(state => activeViewId ? state.campaignData.present.views[activeViewId].scale : null);
  const bgColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const pos = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].pos);
  const size = useSelector(state => state.campaignData.present.cards[cardId].views[activeViewId].size);
  const titleText = useSelector(state => state.campaignData.present.cards[cardId].title);
  const contentText = useSelector(state => (state.campaignData.present.cards[cardId].content ? state.campaignData.present.cards[cardId].content.text : ""));

  const ref = useRef();
  const titleInputRef = useRef();
  const colorButtonRef = useRef();
  const colorDropdownRef = useRef();

  useOutsideClick([ref, toolMenuRef], selected, 
    () => {
      if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
      setSelected(false);
    },
  );
  
  useOutsideClick([colorDropdownRef, colorButtonRef], showColorDropdown,
    () => setShowColorDropdown(false),
  );

  useEffect(() => {
    setTitleValue(titleText);
  }, [setTitleValue, titleText]);

  useEffect(() => {
    setContentTextValue(contentText);
  }, [setContentTextValue, contentText]);

  let rndZ = 100*pos.y + pos.x + 10;
  if (dragging) {
    rndZ = 20000*(pos.y + pos.x + 10);
  } else if (cardId === activeCardId) {
    rndZ = 10000*(pos.y + pos.x + 10);
  }

  return {
    cardConfig: {
      className: "card" +
        ((cardId === activeCardId) ? " active-card" : "") + 
        (blink ? " blink-card" : ""),
      onAnimationEnd: () => {
        setCardAnimation({...cardAnimation, [cardId]: null});
        setBlink(false);
      },
      onClick: () => {
        if (!selected) {
          if (cardId !== activeCardId) dispatch(actions.updActiveCardId(cardId));
          setSelected(true);
        }
      },
      ref,
      style: {
        animation: cardAnimation ? cardAnimation[cardId] : null,
        backgroundColor: bgColor,
      },
    },
    colorDropdownRef,
    contentConfig: {
      onBlur: () => {
        if (editingContent) {
          document.getSelection().removeAllRanges();
          if (contentTextValue !== contentText) {
            dispatch(actions.updCardText(cardId, contentTextValue));
          }
          setEditing(false);
          setEditingContent(false);
        }
      },
      onChange: (event) => setContentTextValue(event.target.value),
      onClick: () => {
        if (!editingContent) {
          setEditing(true);
          setEditingContent(true);
        }
      },
      onDragOver: (event) => event.preventDefault(),
      onKeyDown: (event) => {
        if (editing) {
          if (event.key === 'Tab') {
            event.preventDefault();
            // TODO make tab indent. need to set cursor position after value state update
            // const { selectionStart, selectionEnd } = event.target;
            // const val = event.target.value;
            // const newValue = val.substring(0, selectionStart) + '\t' + val.substring(selectionEnd);
            // event.target.setSelectionRange(0,0);
            // setTempValue(newValue);
          }
        };
      },
      onWheel: (event) => event.stopPropagation(),
      placeholder: "Fill me in!",
      readOnly: !editingContent,
      type: "text",
      value: contentTextValue,
    },
    rndConfig: {
      bounds: "parent",
      disableDragging: editing,
      dragHandleClassName: "title",
      enableResizing: true,
      minHeight: CARD.minHeight,
      minWidth: CARD.minWidth,
      onDragStart: () => setDragging(true),
      onDragStop: (event, data) => {
        setDragging(false);
        if (pos) {
          if (pos.x !== data.x || pos.y !== data.y) {
            dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
          }
        } else {
          dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
        }
      },
      onResizeStop: (event, direction, ref, delta, position) => {
        if (delta.width !== 0 || delta.height !== 0) {
          dispatch(actions.updCardSize(cardId, {width: ref.style.width, height: ref.style.height}));
          if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
              dispatch(actions.updCardPos(cardId, {x: position.x, y: position.y}));
          }
        }
      },
      position: pos,
      resizeGrid: [GRID.size, GRID.size],
      scale: activeViewScale,
      size: size,
      style: { zIndex: rndZ },
    },
    showColorDropdown,
    showMenuDropdown,
    titleConfig: {
      colorButton: {
        onClick: () => setShowColorDropdown(!showColorDropdown),
        ref: colorButtonRef,
      },
      colorButtonDiv: {
        style: {
          borderColor: TEXT_COLOR.forBgColor[bgColor] === 'white' ? 'lightgray' : 'darkgray',
        },
      },
      containerDiv: {
        style: {
          height: GRID.size*3 - 3,
          backgroundColor: editingTitle ? BG_COLORS.edit[bgColor] : bgColor,
        },
      },
      input: {
        maxLength: "50",
        onBlur: () => {
          if (editingTitle) {
            document.getSelection().removeAllRanges();
            if (titleValue !== titleText) {
              dispatch(actions.updCardTitle(cardId, titleValue));
            }
            setEditingTitle(false);
          }
        },
        onChange: (event) => setTitleValue(event.target.value),
        onDoubleClick: () => {
          if (!editingTitle) {
            setEditingTitle(true);
            titleInputRef.current.focus();
            titleInputRef.current.setSelectionRange(titleInputRef.current.value.length, titleInputRef.current.value.length);
          }
        },
        onDragOver: (event) => event.preventDefault(),
        onKeyDown: (event) => {
          if (editingTitle) {
            if (event.key === 'Enter' || event.key === 'Tab') {
              document.getSelection().removeAllRanges();
              if (titleValue !== titleText) {
                dispatch(actions.updCardTitle(cardId, titleValue));
              }
              setEditingTitle(false);
              //TODO: tab goes to content text box
            }
          }
        },
        readOnly: !editingTitle,
        ref: titleInputRef,
        required: true,
        style: {
          color: TEXT_COLOR.forBgColor[bgColor],
          cursor: editingTitle ? "text" : "move", 
          fontSize: CARD_FONT_SIZE.title + 'px',
          userSelect: editingTitle ? "default" : "none",
          MozUserSelect: editingTitle ? "default" : "none",
          WebkitUserSelect: editingTitle ? "default" : "none",
          msUserSelect: editingTitle ? "default" : "none",
        },
        title: titleValue,
        type: "text",
        value: titleValue,
      },
    },
  };
};

export const useColorListHook = ({
  cardId,
}) => {
  const dispatch = useDispatch();

  let colorList = [];
  for (let color in BG_COLORS.display) {
    colorList = [
      ...colorList,
      <button
        key={color}
        onClick={() => dispatch(actions.updCardColor(cardId, color))}
        style={{
          backgroundColor: color
        }}
      />
    ];
  }

  return {
    colorList,
  };
};