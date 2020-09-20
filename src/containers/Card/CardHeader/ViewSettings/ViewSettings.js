import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './ViewSettings.scss';
import * as actions from '../../../../store/actionIndex';
import { CARD_COLORS } from '../../../../shared/constants/colors';

const ViewSettings = (props) => {
  const dispatch = useDispatch();

  const cardColl = useSelector(state => state.card);
  const viewColl = useSelector(state => state.view);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);
  const activeView = useSelector(state => state.viewManage.activeView);
  
  const show = props.show;
  const setShow = props.setShow;
  const cardId = props.id;
  const cardViews = cardColl[cardId].views;
  const cardPos = cardViews[activeView].pos;
  const cardSize = cardViews[activeView].size;
  const cardColor = cardViews[activeView].color;
  const viewSettingsRef = useRef(cardId+activeView+"viewSettings");

  const updCardColor = (view, color) => {
    if (!cardViews[view]) {
      dispatch(actions.connectCardToView(cardId, view, cardPos, cardSize, color));
    } else {
      dispatch(actions.updCardColor(cardId, view, color));
    }
  };
  // updating color for all cards on all views will be a future implementation
  // const updCardColorForAllViews = (color) => dispatch(actions.updCardColorForAllViews(cardId, color));

  const addOrRemoveCard = (view) => {
    if (cardViews[view]) {
      dispatch(actions.removeCardFromView(cardId, view));
    } else {
      dispatch(actions.connectCardToView(cardId, view, cardPos, cardSize, cardColor));
    }
  };

  // useOutsideClick(viewSettingsRef, show, setShow, false);

  let viewSettings = [];
  for (let x in viewOrder) {
    let view = viewOrder[x];
    if (viewColl[view]) {
      let colorList = [];
      for (let color in CARD_COLORS) {
        let colorStyle = {backgroundColor: color, border: ((cardViews[view] && cardViews[view].color === color) ? "1px solid white" : "1px solid black")};
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
  
  return (
    <div
      ref={viewSettingsRef}
      className="viewSettings"
      style={!show ? {display: "none"} : null}
    >
      {viewSettings}
    </div>
  );
};

export default ViewSettings;