import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './CardTitleBar.scss';
import * as actions from '../../../store/actionIndex';
import { TEXT_COLOR_WHEN_BACKGROUND_IS, CARD_TITLEBAR_EDIT_COLORS } from '../../../shared/constants/colors';
import Auxi from '../../../hoc/Auxi';
import ViewSettings from '../CardTitleBar/ViewSettings/ViewSettings';

import SettingsButton from '../../../media/icons/view-settings.png';
import ClosingButton from '../../../media/icons/close.png';

const CardTitleBar = React.memo(props => {
  const dispatch = useDispatch();

  // VARIABLES
  const isSelected = props.isSelected;
  const setEditingCard = props.setEditingCard;
  const [editingTitle, setEditingTitle] = [props.editingTitle, props.setEditingTitle];
  const [showViewSettings, setShowViewSettings] = [props.showViewSettings, props.setShowViewSettings];
  const setEditingTextarea = props.setEditingTextarea;

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.id;
  const cardData = cardColl[cardId];
  const cardColor = cardData.views[activeView].color;
  const cardTitle = (cardData.data && cardData.data.title) ? cardData.data.title : "untitled";
  const cardTitleId = cardId+".title";
  const cardTitleRef = useRef(cardTitleId);

  // FUNCTIONS
  const beginEdit = () => {
    if (!editingTitle) {
      const title = document.getElementById(cardTitleId);
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
      setEditingTitle(true);
      setEditingCard(true);
    }
  };

  const updEdit = () => {
    if (editingTitle) {dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value))}
  };

  const endEdit = () => {
    if (editingTitle) {
      dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value));
      setEditingTitle(false);
      setEditingCard(false);
    }
  };

  const keyPressHandler = (event) => {
    if (cardId === activeCard && isSelected) {
      if (event.key === 'Enter') {
        endEdit();
      }
      if (event.key === 'Tab' && editingTitle) {
        event.preventDefault();
        dispatch(actions.updCardTitle(cardId, cardTitleRef.current.value));
        setEditingTitle(false);
        const textareaId = document.getElementById(cardId+".textarea");
        textareaId.focus();
        textareaId.setSelectionRange(textareaId.value.length, textareaId.value.length);
        setEditingTextarea(true);
      }
    }
  };

  const removeCardFromThisView = () => {
    dispatch(actions.removeCardFromView(cardId, activeView));
    setEditingTitle(false);
    setEditingCard(false);
  };

  useOutsideClick(cardTitleRef, endEdit);

  // STYLES
  const titleBarStyle = {
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], 
    backgroundColor: editingTitle ? CARD_TITLEBAR_EDIT_COLORS[cardColor] : cardColor, 
    cursor: editingTitle ? "text" : "move",
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
  };

  return (
    <Auxi>
      <div className="titleBar">
        <input ref={cardTitleRef} id={cardTitleId}
          className="title" style={titleBarStyle} type="text" required
          value={cardTitle}
          readOnly={!editingTitle}
          onDoubleClick={(cardId === activeCard && isSelected) ? beginEdit : null}
          onChange={updEdit}
          onKeyDown={(e) => keyPressHandler(e)}
        />
        <input className="titleBarButtons" type="image" src={SettingsButton} alt="Settings" 
          onClick={(e) => setShowViewSettings(!showViewSettings)} 
        />
        <input className="titleBarButtons" type="image" src={ClosingButton} alt="Close" 
          onClick={removeCardFromThisView} 
        />
      </div>
      <ViewSettings id={cardId} show={showViewSettings} setShow={setShowViewSettings} />
    </Auxi>
  );
});

export default CardTitleBar;