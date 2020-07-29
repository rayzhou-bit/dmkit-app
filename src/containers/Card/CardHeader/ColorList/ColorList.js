import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './ColorList.scss';
import * as actions from '../../../../store/actionIndex';
import { CARD_COLORS } from '../../../../shared/constants/colors';

const ColorList = (props) => {
  const dispatch = useDispatch();

  const cardColl = useSelector(state => state.card);
  const activeView = useSelector(state => state.viewManage.activeView);

  const show = props.show;
  const setShow = props.setShow;
  const cardId = props.id;
  const cardColor = cardColl[cardId].views[activeView].color;
  const cardData = cardColl[cardId];
  const colorListRef = useRef(cardId+"colorList");

  const updCardColor = (color) => dispatch(actions.updCardColor(cardId, activeView, color));
  const updCardColorForAllViews = (color) => dispatch(actions.updCardColorForAllViews(cardId, color));

  useOutsideClick(colorListRef, show, setShow, false);

  let colorListDiv = <div ref={colorListRef} />
  if (show) {
    let colorList = [];
    for (let color in CARD_COLORS) {
      let buttonStyle = {backgroundColor: color}
      colorList = [
        ...colorList,
        <button key={color} style={buttonStyle} onClick={() => updCardColor(color)}/>
      ];
    }
    colorListDiv = (
      <div ref={colorListRef} className="colorList"> 
        <div className="colorButtons">
          {colorList}
        </div>
        <div className="acceptButtons">
          <button className="buttonAccept" onClick={() => setShow(false)}>Apply One</button>
          <button className="buttonAccept right" onClick={() => updCardColorForAllViews(cardColor)}>Apply All</button>
        </div>
      </div>
    );
  }

  return colorListDiv;
};

export default ColorList;