import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../../../../store/actionIndex';
import { useOutsideClick } from '../../../../../shared/utilityFunctions';
import { GRID } from '../../../../../shared/_grid';
import { CARD_FONT_SIZE } from '../../../../../shared/_fontSize';
import { CARD_TITLEBAR_COLORS, TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../../../shared/colors';

import './CardTitle.scss';
import Menu from '../../../../UI/Menu/Menu';
import TitleInput from '../../../../UI/Inputs/TitleInput';

import OpenMenuDarkImg from '../../../../../assets/icons/drop-down-dark.png';
import OpenMenuLightImg from '../../../../../assets/icons/drop-down-light.png';
import ShrinkImg from '../../../../../assets/icons/shrink-24.png';
import CloseImg from '../../../../../assets/icons/remove-24.png';

const CardTitle = props => {
  const { cardId, setEditingCard } = props;
  const dispatch = useDispatch();

  // STATES
  const [titleValue, setTitleValue] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showOptionMenu, setShowOptionMenu] = useState(false);

  // STORE SELECTORS
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.present.cards[cardId].title);

  // REFS
  const titleInputRef = useRef();
  const showColorMenuBtnRef = useRef();
  const colorMenuRef = useRef();
  const showOptionMenuBtnRef = useRef();
  const optionMenuRef = useRef();

  // FUNCTIONS: CARD TITLE
  useEffect(() => {
    setTitleValue(cardTitle);
  }, [setTitleValue, cardTitle]);

  const beginTitleEdit = () => {
    if (!editingTitle) {
      setEditingTitle(true);
      titleInputRef.current.focus();
      titleInputRef.current.setSelectionRange(titleInputRef.current.value.length, titleInputRef.current.value.length);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {
      document.getSelection().removeAllRanges();
      if (titleValue !== cardTitle) dispatch(actions.updCardTitle(cardId, titleValue));
      setEditingTitle(false);
    }
  };

  const titleKeyPressHandler = (e) => {
    if (editingTitle) {
      if (e.key === 'Enter' || e.key === 'Tab') endTitleEdit(); //TODO: tab goes to content text box
    }
  };

  // FUNCTIONS
  useOutsideClick([colorMenuRef, showColorMenuBtnRef], showColorMenu, () => setShowColorMenu(false));

  useOutsideClick([optionMenuRef, showOptionMenuBtnRef], showOptionMenu, () => setShowOptionMenu(false));
  
  // STYLES

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in CARD_TITLEBAR_COLORS) {
    let colorStyle = { backgroundColor: color };
    colorList = [...colorList,
      <button key={color} style={colorStyle} onClick={() => dispatch(actions.updCardColor(cardId, color))} />
    ];
  }

  return (
    <div className="card-title" style={{height: GRID.size*3 - 3}}>
      {/* <div className="title"> */}
        {/* card title */}
        <input ref={titleInputRef} className="title" 
          style={{
            fontSize: CARD_FONT_SIZE.title+'px',
            color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor],
            backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor,
            cursor: editingTitle ? "text" : "move",
            userSelect: editingTitle ? "default" : "none",
            MozUserSelect: editingTitle ? "default" : "none",
            WebkitUserSelect: editingTitle ? "default" : "none",
            msUserSelect: editingTitle ? "default" : "none",
          }}
          type="text" required maxLength="50"
          value={titleValue ? titleValue : ""} title={titleValue ? titleValue : ""} readOnly={!editingTitle}
          onBlur={endTitleEdit}
          onDoubleClick={beginTitleEdit}
          onChange={e => setTitleValue(e.target.value)}
          onKeyDown={titleKeyPressHandler}
          onDragOver={e => e.preventDefault()}
        />
        {/* <TitleInput className="title" btnClassName="edit-title title-btn btn-24" 
          type="card" color={cardColor} btnSize={24}
          value={cardTitle} saveValue={v => dispatch(actions.updCardTitle(cardId, v))}
          setEditingParent={setEditingCard} /> */}

        {/* button to open color dropdown */}
        <button ref={showColorMenuBtnRef} 
          className="show-color-menu-btn btn btn-24"
          onClick={() => setShowColorMenu(!showColorMenu)}>
          <div className="color-img"
            style={{ backgroundColor: cardColor ? cardColor : "white" }} />
          {!showColorMenu ? <span className="tooltip">Color</span> : null}
          {/* color menu */}
          <div ref={colorMenuRef} className="color-menu" 
            style={{display: showColorMenu ? "grid" : "none"}}>
            {colorList}
          </div>
        </button>

        {/* button to open options dropdown */}
        <button ref={showOptionMenuBtnRef} 
          className="show-option-menu-btn btn btn-24"
          onClick={() => setShowOptionMenu(!showOptionMenu)}>
          <img src={OpenMenuDarkImg} alt="Options" draggable="false" />
          {!showOptionMenu ? <span className="tooltip">Options</span> : null}
          {/* options menu */}
          <div ref={optionMenuRef} className="option-menu"
            style={{display: showOptionMenu ? "block" : "none"}}>
            <Menu options={[
              ["Duplicate card", () => dispatch(actions.copyCard(cardId))],
              ["Remove card", () => dispatch(actions.unlinkCardFromView(cardId))],
              ["divider"],
              ["Rename", beginTitleEdit],
              ["divider"],
              // ["Bring to front"], TODO!
              // ["Send to back"], TODO!
              ["Shrink card", () => dispatch(actions.updCardForm(cardId, "blurb"))],
            ]} />
          </div>
        </button>

        {/* <button className="remove-card title-btn btn-24"
          onClick={() => dispatch(actions.unlinkCardFromView(cardId))}>
          <img src={CloseImg} alt="Close" draggable="false" />
          <span className="tooltip">Remove from view</span>
        </button>
        <button className="shrink title-btn btn-24" 
          onClick={() => dispatch(actions.updCardForm(cardId, "blurb"))}>
          <img src={ShrinkImg} alt="Shrink" draggable="false" />
          <span className="tooltip">Shrink card</span>
        </button> */}
      {/* </div> */}
      
    </div>
  );
};

export default CardTitle;