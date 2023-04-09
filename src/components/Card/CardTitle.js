import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../../../store/actionIndex';
import { useOutsideClick } from '../../../../shared/utilityFunctions';
import { CARD_TITLEBAR_COLORS } from '../../../../shared/constants/colors';
import TitleInput from '../../../UI/Inputs/TitleInput';

import ShrinkImg from '../../../../assets/icons/shrink-24.png';
import CloseImg from '../../../../assets/icons/remove-24.png';

import './index.scss';

const CardTitle = ({
  cardId,
  setEditingCard,
}) => {
  const dispatch = useDispatch();

  // STATES
  const [openColorSelect, setOpenColorSelect] = useState(false);

  // STORE SELECTORS
  const cardColor = useSelector(state => state.campaignData.present.cards[cardId].color);
  const cardTitle = useSelector(state => state.campaignData.present.cards[cardId].title);

  // REFS
  const colorSelectRef = useRef();
  const colorBtnRef = useRef();

  // FUNCTIONS
  useOutsideClick([colorSelectRef, colorBtnRef], openColorSelect, () => setOpenColorSelect(false));
  
  // STYLES
  const colorBtnStyle = { backgroundColor: cardColor ? cardColor : "white" };

  // DISPLAY ELEMENTS
  let colorList = [];
  for (let color in CARD_TITLEBAR_COLORS) {
    let colorStyle = { backgroundColor: color };
    colorList = [...colorList,
      <button key={color} style={colorStyle} onClick={() => dispatch(actions.updCardColor(cardId, color))} />
    ];
  }

  return (
    <>
      <div className="title-container">
        <button ref={colorBtnRef} className="change-color title-btn btn-24"
          onClick={() => setOpenColorSelect(!openColorSelect)}>
          <div style={colorBtnStyle} />
          <span className="tooltip">Change color for view</span>
        </button>
        <button className="remove-card title-btn btn-24"
          onClick={() => dispatch(actions.unlinkCardFromView(cardId))}>
          <img src={CloseImg} alt="Close" draggable="false" />
          <span className="tooltip">Remove from view</span>
        </button>
        <button className="shrink title-btn btn-24" 
          onClick={() => dispatch(actions.updCardForm(cardId, "bubble"))}>
          <img src={ShrinkImg} alt="Shrink" draggable="false" />
          <span className="tooltip">Shrink card</span>
        </button>
        <TitleInput className="title-input" btnClassName="edit-title title-btn btn-24" 
          type="card" color={cardColor} btnSize={24}
          value={cardTitle} saveValue={v => dispatch(actions.updCardTitle(cardId, v))}
          setEditingParent={setEditingCard} />
      </div>
      <div ref={colorSelectRef} className="color-select" 
        style={{display: openColorSelect ? "grid" : "none"}}>
        {colorList}
      </div>
    </>
  );
};

export default CardTitle;