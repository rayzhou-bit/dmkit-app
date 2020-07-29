import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import * as actions from '../../../../store/actionIndex';
import './ViewList.scss';

const ViewList = (props) => {
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
  const viewListRef = useRef(cardId+"viewList");

  const addOrRemoveCard = (view) => {
    if (cardViews[view]) {
      dispatch(actions.removeCardFromView(cardId, view));
    } else {
      dispatch(actions.connectCardToView(cardId, view, cardPos, cardViews.color));
    }
  };
  
  useOutsideClick(viewListRef, show, setShow, false);

  let viewListDiv = <div ref={viewListRef} />
  if (show) {
    let viewList = [];
    for (let x in viewOrder) {
      let view = viewOrder[x];
      if (viewColl[view]) {
        viewList = [
          ...viewList,
          <div key={view}>
            <input
              id={cardId+view}
              type="checkbox"
              checked={cardViews[view] ? true : false}
              onChange={() => addOrRemoveCard(view)}
            />
            <label htmlFor={cardId+view} style={(view===activeView ? {fontWeight: "bold"} : null)}>{viewColl[view].title}</label>
          </div>
        ];
      }
    }
    viewListDiv = <div ref={viewListRef} className="viewList"> {viewList} </div>;
  }

  return viewListDiv;
};

export default ViewList;