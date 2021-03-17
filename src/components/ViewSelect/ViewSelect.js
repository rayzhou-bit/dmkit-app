import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewSelect.scss';
import * as actions from '../../store/actionIndex';
import ViewTab from './ViewTab/ViewTab';

import AddImg from '../../assets/icons/add-32.png';
import LeftArrowImg from '../../assets/icons/left-arrow-32.png';
import RightArrowImg from '../../assets/icons/right-arrow-32.png';

// ViewSelect is the container for all the ViewTab's. This is located at the bottom of the screen.

const ViewSelect = React.memo(props => {
  const dispatch = useDispatch();

  // STORE VALUES
  const viewCollection = useSelector(state => state.campaignData.views);
  const viewOrder = useSelector(state => state.campaignData.viewOrder);

  const tabWidth = 250;

  // ID & REFS
  const viewTabContainerRef = useRef("view-tab-container");

  // FUNCTIONS
  const createView = () => dispatch(actions.createView());

  const scrollLeft = () => {
    viewTabContainerRef.current.scrollBy({left: -400, behavior: 'smooth'});
  };

  const scrollRight = () => {
    viewTabContainerRef.current.scrollBy({left: 400, behavior: 'smooth'});
  };

  let viewTabs = [];
  if (viewCollection) {
    for (let x in viewOrder) {
      let viewId = viewOrder[x];
      if (viewCollection[viewId]) {
        viewTabs = [
          ...viewTabs,
          <ViewTab key={viewId} 
            viewId={viewId} viewTabContainerRef={viewTabContainerRef} tabWidth={tabWidth} />
        ];
      }
    }
  }

  // STYLES
  const tabContStyle = {
    width: ((viewOrder ? viewOrder.length : 0)+0.5) * tabWidth
  };

  return (
    <div className="view-select">
      <div className="add-view btn-32" onClick={createView}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">Add view</span>
      </div>
      <div ref={viewTabContainerRef} className="view-tab-container">
        <div className="view-tab-container-container" style={tabContStyle}>
          {viewTabs}
        <div className="border-line" />
        </div>
      </div>
      <div className="view-scroll-container">
        <div className="view-scroll-left btn-32" onClick={scrollLeft}>
          <img src={LeftArrowImg} alt="Scroll left" draggable="false" />
          <span className="tooltip">Scroll left</span>
        </div>
        <div className="view-scroll-right btn-32" onClick={scrollRight}>
          <img src={RightArrowImg} alt="Scroll right" draggable="false" />
          <span className="tooltip">Scroll right</span>
        </div>
      </div>
    </div>
  );
});

export default ViewSelect;