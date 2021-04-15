import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewSelect.scss';
import * as actions from '../../store/actionIndex';
import { useOutsideClick } from '../../shared/utilityFunctions';
import ViewTab from './ViewTab/ViewTab';

import AddImg from '../../assets/icons/add-32.png';
import MenuImg from '../../assets/icons/menu-32.png';
import LeftArrowImg from '../../assets/icons/left-arrow-32.png';
import RightArrowImg from '../../assets/icons/right-arrow-32.png';

// ViewSelect is the container for all the ViewTab's. This is located at the bottom of the screen.

const ViewSelect = React.memo(props => {
  const dispatch = useDispatch();

  // STATES
  const [openViewList, setOpenViewList] = useState(false);

  // STORE VALUES
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const viewOrder = useSelector(state => state.campaignData.present.viewOrder);
  const viewCollection = useSelector(state => state.campaignData.present.views);

  const tabWidth = 240;

  // REFS
  const viewListRef = useRef();
  const viewListBtnRef = useRef();
  const viewTabContainerRef = useRef();

  // FUNCTIONS
  const wheelHandler = (event) => {
    if (event.deltaY > 0) scrollRight();
    else scrollLeft();
  };
  const scrollLeft = () => viewTabContainerRef.current.scrollBy({left: -1.5 *tabWidth, behavior: 'smooth'});
  const scrollRight = () => viewTabContainerRef.current.scrollBy({left: 1.5 *tabWidth, behavior: 'smooth'});

  useOutsideClick([viewListRef, viewListBtnRef], openViewList, () => setOpenViewList(false));

  // DISPLAY ELEMENTS
  let viewList = [];
  let viewTabs = [];
  if (viewCollection) {
    for (let x in viewOrder) {
      let viewId = viewOrder[x];
      if (viewCollection[viewId]) {
        viewList = [
          ...viewList,
          <button key={viewId} 
            className="view-list-item btn-any" style={{backgroundColor: (viewId === activeViewId) ? "white" : null}}
            title={viewCollection[viewId].title}
            onClick={(viewId !== activeViewId) ? () => dispatch(actions.updActiveViewId(viewId)) : null}>
            {viewCollection[viewId].title}
          </button>
        ];
        viewTabs = [
          ...viewTabs,
          <ViewTab key={viewId} 
            viewId={viewId} viewTabContainerRef={viewTabContainerRef} tabWidth={tabWidth} />
        ];
      }
    }
  }

  // STYLES
  const viewListStyle = {
    bottom: openViewList ? "41px" : "-100vh",
  };

  return (
    <div className="view-select">
      {/* view buttons */}
      <button className="add-view view-select-item btn-32" 
        onClick={() => dispatch(actions.createView())}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">Add tab</span>
      </button>
      <button ref={viewListBtnRef} className="show-view-list view-select-item btn-32"
        onClick={() => setOpenViewList(!openViewList)}>
        <img src={MenuImg} alt="Menu" draggable="false" />
        <span className="tooltip">Show tabs</span>
      </button>
      {/* view tabs */}
      <div ref={viewTabContainerRef} className="view-tab-container"
        onWheel={wheelHandler}>
        <div className="view-tab-container-container">
          {viewTabs}
          <div className="border-line" />
        </div>
      </div>
      {/* view scroll buttons */}
      <button className="view-scroll-left view-select-item btn-32" onClick={scrollLeft}>
        <img src={LeftArrowImg} alt="Scroll left" draggable="false" />
        <span className="tooltip">Scroll left</span>
      </button>
      <button className="view-scroll-right view-select-item btn-32" onClick={scrollRight}>
        <img src={RightArrowImg} alt="Scroll right" draggable="false" />
        <span className="tooltip">Scroll right</span>
      </button>
      {/* view list */}
      <div ref={viewListRef} className="view-list"
        style={viewListStyle}>
        {viewList}
      </div>
    </div>
  );
});

export default ViewSelect;