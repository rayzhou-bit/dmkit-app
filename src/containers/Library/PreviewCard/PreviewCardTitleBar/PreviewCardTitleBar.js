import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './CardTitleBar.scss';
import * as actions from '../../../store/actionIndex';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../shared/constants/colors';
import Auxi from '../../../hoc/Auxi';
import ViewSettings from '../CardTitleBar/ViewSettings/ViewSettings';

import SettingsButton from '../../../media/icons/adjust.svg';
import ClosingButton from '../../../media/icons/close.svg';

const CardTitleBar = (props) => {
  const dispatch = useDispatch();

  const setEditingCard = props.setEditingCard;
  const [editingTitle, setEditingTitle] = useState(false);
  const [showViewSettings, setShowViewSettings] = useState(false);

  const cardColl = useSelector(state => state.card);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardColor = cardData.views[activeView].color;
  const cardTitle = (cardData.data && cardData.data.title) ? cardData.data.title : "untitled";
  const cardTitleRef = useRef(cardId+"title");

  const removeCardFromThisView = () => dispatch(actions.removeCardFromView(cardId, activeView));

  const enterHandler = (event) => {
    if (event.which === 13) {
      dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value));
      setEditingTitle(false);
      setEditingCard(false);
    }
  };

  const outsideClickFunc = () => {
    dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value));
    setEditingTitle(false);
    setEditingCard(false);
  };
  useOutsideClick(cardTitleRef, editingTitle, outsideClickFunc);

  const titleBarTextStyle = {
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor, 
    cursor: editingTitle ? "text" : "move"
  };

  return (
    <Auxi>
      <div className="previewTitleBar">
        <div className="previewTitle">{cardTitle}</div>
        <div className="previewDeleteButton">
          <input type="image" src={DeleteButton} alt="Delete" onClick={setCardDelete} />
        </div>
      </div>
      
      <div className="titleBar">
        <input 
          ref={cardTitleRef}
          className="title"
          style={titleBarTextStyle}
          onDoubleClick={() => {setEditingTitle(true); setEditingCard(true)}}
          onKeyUp={editingTitle ? (event) => enterHandler(event) : null}
          defaultValue={cardTitle}
          readOnly={!editingTitle}
          type="text"
          required
        />
        <div className="titleBarButtons">
          <input type="image" src={SettingsButton} alt="Settings" onClick={(e) => setShowViewSettings(!showViewSettings)} />
        </div>
        <div className="titleBarButtons">
          <input type="image" src={ClosingButton} alt="Close" onClick={removeCardFromThisView} />
        </div>
      </div>
      <ViewSettings id={cardId} show={showViewSettings} setShow={setShowViewSettings} />
    </Auxi>
  );
};

export default CardTitleBar;