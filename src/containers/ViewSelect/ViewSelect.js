import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewSelect.scss';
import * as actions from '../../store/actionIndex';
import ViewTab from './ViewTab/ViewTab';

import AddImg from '../../media/icons/add.png';

// ViewSelect is the container for all the ViewTab's. This is located at the bottom of the screen.

const ViewSelect = React.memo(props => {
  const dispatch = useDispatch();

  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const campaignData = useSelector(state => state.campaignColl[campaignId]);
  const activeViewId = campaignData.activeViewId;
  const viewOrder = campaignData.viewOrder;
  const viewCreateCnt = campaignData.viewCreateCnt;

  const createView = () => dispatch(actions.createView(campaignId, activeViewId, viewCreateCnt));

  let viewTabs = [];
  if (viewColl) {
    for (let x in viewOrder) {
      let view = viewOrder[x]
      if (viewColl[view]) {
        viewTabs = [
          ...viewTabs,
          <ViewTab key={view} id={view} position={x}/>
        ];
      }
    }
  }

  return (
    <div id="viewSelect">
      <div id="addView" onClick={createView}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">Add a view</span>
      </div>
      <div id="viewTabs">
        {viewTabs}
        <div className="filler" />
      </div>
    </div>
  );
});

export default ViewSelect;