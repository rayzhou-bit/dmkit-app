import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewSelect.scss';
import * as actions from '../../store/actionIndex';
import ViewTab from './ViewTab/ViewTab';

// ViewSelect is the container for all the ViewTab's. This is located at the bottom of the screen.

const ViewSelect = props => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const viewColl = useSelector(state => state.view);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);

  const setViewCreate = () => dispatch(actions.setViewCreate(user, campaign, viewOrder));

  let viewTabs = [];
  if (viewColl) {
    for (let x in viewOrder) {
      let view = viewOrder[x]
      if (viewColl[view]) {
        viewTabs = [
          ...viewTabs,
          <ViewTab key={view} id={view} />
        ];
      }
    }
  }

  return (
    <div id="viewSelect">
      <button onClick={setViewCreate}>+</button>
      {viewTabs}
    </div>
  );
};

export default ViewSelect;