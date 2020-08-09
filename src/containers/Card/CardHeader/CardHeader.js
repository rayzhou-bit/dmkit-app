import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './CardHeader.scss';
import * as actions from '../../../store/actionIndex';
import { TEXT_COLOR_WHEN_BACKGROUND_IS } from '../../../shared/constants/colors';
import Auxi from '../../../hoc/Auxi';
import ViewSettings from '../CardHeader/ViewSettings/ViewSettings';
import ViewList from './ViewList/ViewList';
import ColorList from './ColorList/ColorList';

import ViewSettingsButton from '../../../media/icons/adjust.svg';
import ClosingButton from '../../../media/icons/close.svg';

const CardHeader = (props) => {
  const dispatch = useDispatch();

  const setEditingCard = props.setEditingCard;
  const [editingTitle, setEditingTitle] = useState(false);
  const [showViewSettings, setShowViewSettings] = useState(false);

  const [showViewList, setShowViewList] = useState(false);
  const [showColorList, setShowColorList] = useState(false);

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

  return (
    <Auxi>
      <div className="header">
        <input 
          ref={cardTitleRef}
          className="title"
          style={{color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColor], backgroundColor: cardColor}}
          onDoubleClick={() => {setEditingTitle(true); setEditingCard(true)}}
          onKeyUp={editingTitle ? (event) => enterHandler(event) : null}
          defaultValue={cardTitle}
          readOnly={!editingTitle}
          type="text"
          required
        />
        <div className="headerButtons">
          {/* {!showColorList ? <button onClick={() => setShowColorList(!showColorList)}>C</button> : null}
          {!showViewList ? <button onClick={(() => setShowViewList(true))}>V</button> : null} */}
          <input type="image" src={ViewSettingsButton} onClick={(e) => setShowViewSettings(!showViewSettings)} />
          <input type="image" src={ClosingButton} onClick={removeCardFromThisView} />
        </div>
      </div>
      <ViewSettings id={cardId} show={showViewSettings} setShow={setShowViewSettings} />
      {/* <ColorList id={cardId} show={showColorList} setShow={setShowColorList} />
      <ViewList id={cardId} show={showViewList} setShow={setShowViewList} /> */}
    </Auxi>
  );
};

export default CardHeader;

// const func = (nestedFunc, args) => {nestedFunc(args)};

// func(nestedFunc, [arg1, arg2]);