import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './Card.scss';
import * as actions from '../../store/actionIndex';
import { GRID } from '../../shared/constants/grid';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS, CARD_TITLEBAR_COLORS } from '../../shared/constants/colors';

import BubbleButton from '../../media/icons/reduce.png';
import SettingsButton from '../../media/icons/view-settings.png';
import ClosingButton from '../../media/icons/close.png';

const Card = props => {
  const {cardId, cardState, activeView, cardAnimation, setCardAnimation} = props;
  const dispatch = useDispatch();

  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const editingCard = (editingTitle || editingText) ? true : false;

  // STORE SELECTORS
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const viewColl = useSelector(state => state.view);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);

  // VARIABLES
  const cardViews = cardState.views;
  const cardData = cardState.data;
  const cardPos = cardViews[activeView].pos;
  const cardSize = cardViews[activeView].size;
  const cardColor = cardViews[activeView].color;
  const cardType = cardViews[activeView].cardType;
  const cardTitle = cardData ? cardData.title : "";
  const cardText = cardData ? cardData.text : "";

  // IDS & REFS
  const cardRef = useRef(cardId+".card");
  const cardTitleId = cardId+".title";
  const cardTitleRef = useRef(cardTitleId);
  const cardTextId = cardId+".textarea";
  const cardTextRef = useRef(cardTextId);
  const viewSettingsId = cardId+"."+activeView+".viewSettings";
  const viewSettingsRef = useRef(viewSettingsId);
  const viewSettingsBtnRef = useRef(viewSettingsId+".btn")

  // FUNCTIONS: CARD
  const dragStopHandler = (event, data) => dispatch(actions.updCardPos(cardId, activeView, {x: data.x, y: data.y}));

  const resizeStopHandler = (event, direction, ref, delta, position) => {
    dispatch(actions.updCardSize(cardId, activeView, {width: ref.style.width, height: ref.style.height}));
    if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
      dispatch(actions.updCardPos(cardId, activeView, {x: position.x, y: position.y}));
    }
  };

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCard) {dispatch(actions.updActiveCard(cardId))}
      setIsSelected(true);
    }
  };
  // useEffect(() => {
  //   const outsideClickCardHandler = (event) => {
  //     if (cardRef.current && !cardRef.current.contains(event.target)) {
  //       if (cardId === activeCard) {dispatch(actions.updActiveCard(null))}
  //       setIsSelected(false);
  //     }
  //   }

  //   if (isSelected) {document.addEventListener("mousedown", outsideClickCardHandler)}
  //   return () => {
  //     document.removeEventListener("mousedown", outsideClickCardHandler);
  //   }
  // }, [isSelected]);
  const outsideClickCardHandler = () => {
    if (cardId === activeCard) {dispatch(actions.updActiveCard(null))}
    setIsSelected(false);
  };
  useOutsideClick(cardRef, isSelected, outsideClickCardHandler);

  const onAnimationEnd = () => {
    setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    })
  };

  // FUNCTIONS: TITLEBAR
  const startTitleEdit = () => {
    if (!editingTitle) {
      const title = document.getElementById(cardTitleId);
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
      setEditingTitle(true);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {setEditingTitle(false)}
  };

  const updTitleEdit = () => {
    if (editingTitle) {dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value))}
  };

  const keyPressTitleHandler = (event) => {
    if (isSelected && editingTitle) {
      if (event.key === 'Enter') {
        endTitleEdit();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        endTitleEdit();
        startTextEdit();
      }
    }
  };

  const removeCardFromThisView = () => {
    if (!editingCard) {
      dispatch(actions.removeCardFromView(cardId, activeView));
      endTitleEdit();
    }
  };

  // useEffect(() => {
  //   const outsideClickTitleHandler = (event) => {
  //     if (cardTitleRef.current && !cardTitleRef.current.contains(event.target)) {
  //       endTitleEdit();
  //     }
  //   }

  //   if (editingTitle) {document.addEventListener("mousedown", outsideClickTitleHandler)}
  //   return () => {
  //     document.removeEventListener("mousedown", outsideClickTitleHandler);
  //   }
  // }, [editingTitle]);
  useOutsideClick(cardTitleRef, editingTitle, endTitleEdit);

  // FUNCTIONS: TEXT BODY
  const startTextEdit = () => {
    if (!editingText) {
      const text = document.getElementById(cardTextId);
      text.focus();
      text.setSelectionRange(text.value.length, text.value.length);
      setEditingText(true);
    }
  };

  const endTextEdit = () => {
    if (editingText) {setEditingText(false)}
  };

  const updTextEdit = () => {
    if (editingText) {dispatch(actions.updCardText(cardId, cardTextRef.current.value))}
  };

  const keyPressTextHandler = (event) => {
    if (isSelected && editingText) {
      if (event.key === 'Tab') {
        event.preventDefault();
        endTextEdit();
      }
    }
  };

  const updCardColor = (view, color) => {
    if (!cardViews[view]) {
      dispatch(actions.connectCardToView(cardId, view, cardPos, cardSize, color));
    } else {
      dispatch(actions.updCardColor(cardId, view, color));
    }
  };

  const addOrRemoveCard = (view) => {
    if (cardViews[view]) {
      dispatch(actions.removeCardFromView(cardId, view));
    } else {
      dispatch(actions.connectCardToView(cardId, view, cardPos, cardSize, cardColor));
    }
  };

  // useEffect(() => {
  //   const outsideClickTextHandler = (event) => {
  //     if (cardTextRef.current && !cardTextRef.current.contains(event.target)) {
  //       endTextEdit();
  //     }
  //   }

  //   if (editingText) {document.addEventListener("mousedown", outsideClickTextHandler)}
  //   return () => {
  //     document.removeEventListener("mousedown", outsideClickTextHandler);
  //   }
  // }, [editingText]);
  useOutsideClick(cardTextRef, editingText, endTextEdit);

  // FUNCTIONS: VIEW SETTINGS
  // useEffect(() => {
  //   const outsideClickViewSettingsHandler = (event) => {
  //     if (viewSettingsRef.current && !viewSettingsRef.current.contains(event.target) && !viewSettingsBtnRef.current.contains(event.target)) {
  //       setShowViewSettings(false);
  //     }
  //   }

  //   if (showViewSettings) {document.addEventListener("mousedown", outsideClickViewSettingsHandler)}
  //   return () => {
  //     document.removeEventListener("mousedown", outsideClickViewSettingsHandler);
  //   }
  // }, [showViewSettings]);
  useOutsideClick(viewSettingsRef, showViewSettings, setShowViewSettings, false, viewSettingsBtnRef);
  
  // FUNCTIONS: BUBBLE
  const changeTypeToCard = () => dispatch(actions.updCardType(cardId, activeView, "card"));

  const changeTypeToBubble = () => dispatch(actions.updCardType(cardId, activeView, "bubble"));

  // STYLES: CARD
  const toFrontStyle = {zIndex: cardId === activeCard ? 10 : 0};

  const cardStyle = {
    backgroundColor: cardColor,
    border: cardId === activeCard ? '3px solid black' : '1px solid black',
    margin: cardId === activeCard ? '0px' : '2px',
    animation: cardAnimation ? cardAnimation[cardId] : null,
  };
  
  // STYLES: TITLEBAR
  const titleBarStyle = {
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor, 
    cursor: editingTitle ? "text" : "move",
  };

  // STYLES: TEXT BODY
  const textBodyStyle = {
    backgroundColor: editingText ? "white" : "lightgray",
    userSelect: "none",
  };

  // STYLES: BUBBLE
  const bubbleLetterStyle = {
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor],
  };

  // DISPLAY ELEMENTS
  let viewSettings = [];
  for (let x in viewOrder) {
    let view = viewOrder[x];
    if (viewColl[view]) {
      let colorList = [];
      for (let color in CARD_TITLEBAR_COLORS) {
        let colorStyle = {
          backgroundColor: color, 
          border: ((cardViews[view] && cardViews[view].color === color) ? "2px solid white" : "1px solid black")
        };
        colorList = [
          ...colorList,
          <button key={color} style={colorStyle} onClick={() => updCardColor(view, color)}/>
        ];
      }
      viewSettings = [
        ...viewSettings,
        <div key={view} className="viewRow">
          <div className="viewToggle">
            <label className="switch">
              <input id={cardId+view} type="checkbox" checked={cardViews[view]} disabled={view===activeView} onChange={() => addOrRemoveCard(view)} />
              <span className="slider" style={(cardViews[view]) ? {backgroundColor: cardViews[view].color} : null}/>
            </label>
            <label className="viewName" htmlFor={cardId+view} style={(view===activeView ? {fontWeight: "bold"} : null)}>{viewColl[view].title}</label>
          </div>
          <div className="colorSelection">{colorList}</div>
        </div>
      ];
    }
  }

  const cardObject = (
    <Rnd style={toFrontStyle}
      bounds="parent"
      // position and dragging properties
      disableDragging={editingCard}
      position={cardPos}
      dragGrid={[GRID.size, GRID.size]}
      dragHandleClassName="titleBar"
      // size and resizing properties
      size={cardSize}
      minWidth={GRID.size*5}
      minHeight={GRID.size*5}
      resizeGrid={[GRID.size, GRID.size]}
      // functions
      onDragStop={dragStopHandler}
      onResizeStop={resizeStopHandler}
      onClick={cardClickHandler}
    >
      <div ref={cardRef} className="card" style={cardStyle}
        onAnimationEnd={onAnimationEnd}>
        <div className="titleBar">
          <input id={cardTitleId} ref={cardTitleRef}
            className="titleInput" style={titleBarStyle}
            type="text" required
            value={cardTitle} readOnly={!editingTitle}
            onDoubleClick={(cardId === activeCard) ? startTitleEdit : null}
            onChange={updTitleEdit}
            onKeyUp={(e) => keyPressTitleHandler(e)}
          />
          <input className="titleButtons" type="image" src={BubbleButton} alt="Reduce"
            onClick={changeTypeToBubble}
          />
          <input ref={viewSettingsBtnRef}
            className="titleButtons" type="image" src={SettingsButton} alt="Settings" 
            onClick={() => setShowViewSettings(!showViewSettings)} 
          />
          <input className="titleButtons" type="image" src={ClosingButton} alt="Close" 
            onClick={removeCardFromThisView} 
          />
        </div>
        <div className="textBody">
          <textarea id={cardTextId} ref={cardTextRef}
            className="textTextarea" style={textBodyStyle} 
            type="text"
            value={cardText} readOnly={!editingText}
            onClick={(cardId === activeCard) ? startTextEdit : null}
            onDoubleClick={(cardId !== activeCard) ? startTextEdit : null}
            onChange={updTextEdit}
            onKeyDown={(e) => keyPressTextHandler(e)}
          />
        </div>
        <div ref={viewSettingsRef} className="viewSettings" style={!showViewSettings ? {display: "none"} : null}>
          {viewSettings}
        </div>
      </div>
    </Rnd>
  );

  const bubbleObject = (
    <Rnd
      bounds="parent"
      // position and dragging properties
      position={cardPos}
      dragGrid={[GRID.size, GRID.size]}
      // size and resizing properties
      enableResizing={false}
      size={{width: GRID.size*2, height: GRID.size*2}}
      // functions
      onDragStop={dragStopHandler}
      onClick={cardClickHandler}
      onDoubleClick={changeTypeToCard}
    >
      <div ref={cardRef} className="bubble" style={cardStyle}>
        <div className="letter" style={bubbleLetterStyle}>{cardTitle ? cardTitle.charAt(0) : ""}</div>
      </div>
    </Rnd>
  );

  return (
    cardType === "bubble"
      ? bubbleObject 
      : cardObject
  );
};

export default Card;
