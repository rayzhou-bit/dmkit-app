import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import './Card.scss';
import * as actions from '../../../store/actionIndex';
import { useOutsideClick } from '../../../shared/utilityFunctions';
import { GRID } from '../../../shared/constants/grid';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS, CARD_TITLEBAR_COLORS } from '../../../shared/constants/colors';

import ShrinkImg from '../../../assets/icons/shrink-24.png';
import DotDotDotImg from '../../../assets/icons/view-settings-24.png';
import CloseImg from '../../../assets/icons/remove-24.png';

const Card = props => {
  const {cardId, cardData, activeViewId, cardAnimation, setCardAnimation, toolMenuRef} = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const editingCard = (editingTitle || editingText) ? true : false;

  // STORE SELECTORS
  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const activeCardId = useSelector(state => state.dataManager.activeCardId);
  const viewOrder = useSelector(state => state.campaignColl[campaignId].viewOrder);

  // VARIABLES
  const cardViews = cardData.views;
  const cardContent = cardData.content;
  const cardPos = cardViews[activeViewId].pos;
  const cardSize = cardViews[activeViewId].size;
  const cardColor = cardViews[activeViewId].color;
  const cardType = cardViews[activeViewId].cardType;
  const cardTitle = cardContent ? cardContent.title : "";
  const cardText = cardContent ? cardContent.text : "";

  // IDS & REFS
  const cardRef = useRef(cardId+".card");
  const cardTitleId = cardId+".title";
  const cardTitleRef = useRef(cardTitleId);
  const cardTextId = cardId+".textarea";
  const cardTextRef = useRef(cardTextId);
  const viewSettingsId = cardId+"."+activeViewId+".view-settings";
  const viewSettingsRef = useRef(viewSettingsId);
  const viewSettingsBtnRef = useRef(viewSettingsId+".btn")

  // FUNCTIONS: CARD
  const dragStopHandler = (event, data) => {
    setDragging(false);
    dispatch(actions.updCardPos(cardId, activeViewId, {x: data.x, y: data.y}));
  };

  const resizeStopHandler = (event, direction, ref, delta, position) => {
    dispatch(actions.updCardSize(cardId, activeViewId, {width: ref.style.width, height: ref.style.height}));
    if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
      dispatch(actions.updCardPos(cardId, activeViewId, {x: position.x, y: position.y}));
    }
  };

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) {dispatch(actions.updActiveCardId(cardId))}
      setIsSelected(true);
    }
  };

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
      dispatch(actions.unlinkCardFromView(cardId, activeViewId));
      endTitleEdit();
    }
  };

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
      dispatch(actions.linkCardToView(cardId, view, cardPos, cardSize, color));
    } else {
      dispatch(actions.updCardColor(cardId, view, color));
    }
  };

  const addOrRemoveCard = (view) => {
    if (cardViews[view]) {
      dispatch(actions.unlinkCardFromView(cardId, view));
    } else {
      dispatch(actions.linkCardToView(cardId, view, cardPos, cardSize, cardColor));
    }
  };

  // FUNCTIONS: OUTSIDECLICKS
  const outsideClickCardHandler = () => {
    if (cardId === activeCardId) {dispatch(actions.updActiveCardId(null))}
    setIsSelected(false);
  };
  useOutsideClick([cardRef, toolMenuRef], isSelected, outsideClickCardHandler);
  useOutsideClick([cardTitleRef, toolMenuRef], editingTitle, endTitleEdit);
  useOutsideClick([cardTextRef, toolMenuRef], editingText, endTextEdit);
  useOutsideClick([viewSettingsRef, viewSettingsBtnRef], showViewSettings, setShowViewSettings, false);
  
  // FUNCTIONS: BUBBLE
  const changeTypeToCard = () => dispatch(actions.updCardType(cardId, activeViewId, "card"));
  const changeTypeToBubble = () => dispatch(actions.updCardType(cardId, activeViewId, "bubble"));

  // STYLES: CARD
  const toFrontStyle = {
    zIndex: dragging ? 11 : cardId === activeCardId ? 10 : 0
  };
  const cardStyle = {
    backgroundColor: cardColor,
    border: cardId === activeCardId ? '3px solid black' : '1px solid black',
    margin: cardId === activeCardId ? '0px' : '2px',
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
        <div key={view} className="view-row">
          <div className="view-toggle">
            <label className="switch">
              <input id={cardId+view} type="checkbox" checked={cardViews[view]} disabled={view===activeViewId} onChange={() => addOrRemoveCard(view)} />
              <span className="slider" style={(cardViews[view]) ? {backgroundColor: cardViews[view].color} : null}/>
            </label>
            <label className="view-title" htmlFor={cardId+view} style={(view===activeViewId ? {fontWeight: "bold"} : null)}>{viewColl[view].title}</label>
          </div>
          <div className="color-selection">{colorList}</div>
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
      dragHandleClassName="title-bar"
      // size and resizing properties
      size={cardSize}
      minWidth={GRID.size*5}
      minHeight={GRID.size*5}
      resizeGrid={[GRID.size, GRID.size]}
      // functions
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      onResizeStop={resizeStopHandler}
      onClick={cardClickHandler}
    >
      <div ref={cardRef} className="card" style={cardStyle}
        onAnimationEnd={onAnimationEnd}>
        <div className="title-bar">
          <input id={cardTitleId} ref={cardTitleRef}
            className="title-input" style={titleBarStyle}
            type="text" required
            value={cardTitle} readOnly={!editingTitle}
            onDoubleClick={(cardId === activeCardId) ? startTitleEdit : null}
            onChange={updTitleEdit}
            onKeyDown={e => keyPressTitleHandler(e)}
          />
          <div className="shrink button-24" onClick={changeTypeToBubble}>
            <img src={ShrinkImg} alt="Shrink" draggable="false" />
            <span className="tooltip">Shrink card</span>
          </div>
          <div ref={viewSettingsBtnRef} className="view-setting button-24" onClick={() => setShowViewSettings(!showViewSettings)}>
            <img src={DotDotDotImg} alt="Settings" draggable="false" />
            <span className="tooltip">Show view settings</span>
          </div>
          <div className="remove-card button-24" onClick={removeCardFromThisView}>
            <img src={CloseImg} alt="Close" draggable="false" />
            <span className="tooltip">Remove card from this view</span>
          </div>
        </div>
        <div className="text-body">
          <textarea id={cardTextId} ref={cardTextRef}
            className="text-textarea" style={textBodyStyle} 
            type="text"
            value={cardText} readOnly={!editingText}
            placeholder="Fill me in!"
            onClick={(cardId === activeCardId) ? startTextEdit : null}
            onDoubleClick={(cardId !== activeCardId) ? startTextEdit : null}
            onChange={updTextEdit}
            onKeyDown={(e) => keyPressTextHandler(e)}
          />
        </div>
        <div ref={viewSettingsRef} 
          className="view-settings" style={{display: showViewSettings ? "block" : "none"}}>
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
