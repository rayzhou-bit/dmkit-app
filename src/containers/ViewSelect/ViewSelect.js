import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewSelect.scss';
import * as actions from '../../store/actionIndex';
import ViewTab from './ViewTab/ViewTab';

import AddImg from '../../media/icons/add.png';

// ViewSelect is the container for all the ViewTab's. This is located at the bottom of the screen.

const ViewSelect = React.memo(props => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.user.user);
  const campaign = useSelector(state => state.campaignManage.activeCampaign);
  const viewColl = useSelector(state => state.viewColl);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);
  const viewCreateCnt = useSelector(state => state.viewManage.createCount);

  const setViewCreate = () => dispatch(actions.setViewCreate(viewCreateCnt));

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
      <div id="addView" onClick={setViewCreate}>
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