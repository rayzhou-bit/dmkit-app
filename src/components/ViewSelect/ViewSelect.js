import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewSelect.scss';
import * as actions from '../../store/actionIndex';
import ViewTab from './ViewTab/ViewTab';

const ViewSelect = props => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const views = useSelector(state => state.views.views);
  const viewOrder = useSelector(state => state.views.viewOrder);
  // const activeView = useSelector(state => state.views.activeView);

  // const fetchViews = useCallback(() => dispatch(actions.fetchViews(user, campaign, activeView)), []);
  const createView = useCallback(() => dispatch(actions.createView(user, campaign, viewOrder)));

  // useEffect(() => {
  //   console.log('ViewSelect: useEffect');
  //   fetchViews();
  // }, [fetchViews]);

  let viewTabs = [];
  if (views) {
    for (let view in viewOrder) {
      const id = viewOrder[view];
      if (views[id]) {
        viewTabs = [
          ...viewTabs,
          <ViewTab key={id} id={id} title={views[id].title}/>
        ];
      }
    }
  }

  return (
    <div id="viewSelect">
      <button onClick={createView}>+</button>
      {viewTabs}
    </div>
  );
};

export default ViewSelect;