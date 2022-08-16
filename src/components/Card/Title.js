import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { useOutsideClick } from '../../shared/utils';
import { BG_COLORS, TEXT_COLOR_WHEN_BACKGROUND_IS } from '../../shared/_styles';

import './index.scss';
import Menu from '../UI/Menu/Menu';

import OpenMenuDarkImg from '../../assets/icons/drop-down-dark.png';
import OpenMenuLightImg from '../../assets/icons/drop-down-light.png';

const CardTitle = ({
  cardId,
  titleConfig,
  showColorDropdown,
}) => {
  const dispatch = useDispatch();

  // STATES
  const [editingTitle, setEditingTitle] = useState(false);
  const [showOptionMenu, setShowOptionMenu] = useState(false);

  // STORE SELECTORS
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);

  // REFS
  const titleInputRef = useRef();
  const showOptionMenuBtnRef = useRef();
  const optionMenuRef = useRef();

  // FUNCTIONS: CARD TITLE

  const beginTitleEdit = () => {
    if (!editingTitle) {
      setEditingTitle(true);
      titleInputRef.current.focus();
      titleInputRef.current.setSelectionRange(titleInputRef.current.value.length, titleInputRef.current.value.length);
    }
  };

  // FUNCTIONS
  useOutsideClick([optionMenuRef, showOptionMenuBtnRef], showOptionMenu, () => setShowOptionMenu(false));

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in BG_COLORS.display) {
    let colorStyle = { backgroundColor: color };
    colorList = [...colorList,
      <button key={color} style={colorStyle} onClick={() => dispatch(actions.updCardColor(cardId, color))} />
    ];
  }

  return (
    <div 
      className="card-title" 
      {...titleConfig.containerDiv}
    >
      <input 
        className="title"
        {...titleConfig.input}
      />
      <button 
        className="show-color-menu-btn btn btn-24"
        {...titleConfig.colorButton}
      >
        <div
          className="color-img" 
          {...titleConfig.colorButtonDiv}
        />
        {!showColorDropdown ? <span className="tooltip">Color</span> : null}
      </button>

        {/* button to open options dropdown */}
        {/* TODO there are buttons under this button! cannot do this */}
        <button ref={showOptionMenuBtnRef} 
          className="show-option-menu-btn btn btn-24"
          onClick={() => setShowOptionMenu(!showOptionMenu)}>
          <img src={TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor] === 'white' ? OpenMenuLightImg : OpenMenuDarkImg} 
            alt="Options" draggable="false" />
          {!showOptionMenu ? <span className="tooltip">Options</span> : null}

        </button>
        {/* options menu */}
        <div ref={optionMenuRef} className="option-menu"
          style={{display: showOptionMenu ? "block" : "none"}}>
          <Menu options={[
            ["Rename", beginTitleEdit],
            ["divider"],
            ["Duplicate card", () => dispatch(actions.copyCard(cardId))],
            ["Shrink card", () => dispatch(actions.updCardForm(cardId, "blurb"))],
            ["divider"],
            ["Remove card", () => dispatch(actions.unlinkCardFromView(cardId)), 'red'],
            // ["Bring to front"], TODO!
            // ["Send to back"], TODO!
          ]} />
        </div>
      
    </div>
  );
};

export default CardTitle;