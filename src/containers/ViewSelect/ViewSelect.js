import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewSelect.scss';
import * as actions from '../../store/actionIndex';
import ViewTab from './ViewTab/ViewTab';

import AddImg from '../../media/icons/add-32.png';
import LeftArrowImg from '../../media/icons/left-arrow-32.png';
import RightArrowImg from '../../media/icons/right-arrow-32.png';

// ViewSelect is the container for all the ViewTab's. This is located at the bottom of the screen.

const ViewSelect = React.memo(props => {
  const dispatch = useDispatch();

  // STORE VALUES
  const campaignColl = useSelector(state => state.campaignColl);
  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const activeViewId = campaignColl[campaignId] ? campaignColl[campaignId].activeViewId : null;
  const viewOrder = campaignColl[campaignId] ? campaignColl[campaignId].viewOrder : [];
  const viewCreateCnt = campaignColl[campaignId] ? campaignColl[campaignId].viewCreateCnt : [];

  const tabWidth = 200;

  // ID & REFS
  const viewTabContainerId = "view-tab-container";

  // FUNCTIONS
  const createView = () => dispatch(actions.createView(campaignId, activeViewId, viewCreateCnt));

  const scrollLeft = () => {
    document.getElementById(viewTabContainerId).scrollBy({left: -200, behavior: 'smooth'});
  };

  const scrollRight = () => {
    document.getElementById(viewTabContainerId).scrollBy({left: 200, behavior: 'smooth'});
  };

  let viewTabs = [];
  if (viewColl) {
    for (let x in viewOrder) {
      let viewId = viewOrder[x];
      if (viewColl[viewId]) {
        viewTabs = [
          ...viewTabs,
          <ViewTab key={viewId} viewId={viewId} containerId={viewTabContainerId} tabWidth={tabWidth} />
        ];
      }
    }
  }

  // STYLES
  const tabContStyle = {
    width: (viewOrder.length+0.5) * tabWidth
  };

  return (
    <div id="view-select">
      <div className="add-view button-32" onClick={createView}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">Add a view</span>
      </div>
      <div id={viewTabContainerId}>
        <div className="view-tab-container-container" style={tabContStyle}>
          {viewTabs}
        <div className="border-line" />
        </div>
      </div>
      <div className="view-scroll-container">
        <div className="view-scroll-left button-32" onClick={scrollLeft}>
          <img src={LeftArrowImg} alt="Scroll left" draggable="false" />
          <span className="tooltip">Scroll left</span>
        </div>
        <div className="view-scroll-right button-32" onClick={scrollRight}>
          <img src={RightArrowImg} alt="Scroll right" draggable="false" />
          <span className="tooltip">Scroll right</span>
        </div>
      </div>
    </div>
  );
});

export default ViewSelect;