import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './TabBar.scss';
import * as actions from '../../store/actionIndex';
import { useOutsideClick } from '../../shared/utilityFunctions';
import Tab from './Tab/Tab';
import Menu from '../UI/Menu/Menu';

import AddImg from '../../assets/icons/add-24.png';
import MenuImg from '../../assets/icons/menu-24.png';
import LeftArrowImg from '../../assets/icons/012-left-arrow.png';
import RightArrowImg from '../../assets/icons/013-right-arrow.png';

// TabBar is the container for all the Tab's. This is located at the bottom of the screen.

const TabBar = React.memo(props => {
  const dispatch = useDispatch();

  // STATES
  const [openTabList, setOpenTabList] = useState(false);
  const [scroll, setScroll] = useState(0);    // this is used for scroll-container with translateX
  const [containerSize, setContainerSize] = useState(0)
  const tabWidth = 200;

  // STORE VALUES
  const viewOrder = useSelector(state => state.campaignData.present.viewOrder);
  const viewCollection = useSelector(state => state.campaignData.present.views);

  // REFS
  const tabListRef = useRef();
  const tabListBtnRef = useRef();
  const tabsContainerRef = useRef();

  // FUNCTIONS
  useEffect(() => {
    setContainerSize(tabWidth * (viewOrder ? viewOrder.length : 5));
  }, [viewOrder]);

  const wheelHandler = (event) => {
    if (event.deltaY > 0) scrollRight();
    else scrollLeft();
  };
  // const scrollLeft = () => tabsContainerRef.current.scrollBy({left: -1.5 *tabWidth, behavior: 'smooth'});
  // const scrollRight = () => tabsContainerRef.current.scrollBy({left: 1.5 *tabWidth, behavior: 'smooth'});
  // const scrollTo = (viewId) => tabsContainerRef.current.scrollTo({left: viewOrder.indexOf(viewId) *tabWidth, behavior: 'smooth'});
  const scrollLeft = () => setScroll(Math.min(scroll+tabWidth, 0));
  const scrollRight = () => setScroll(Math.max(scroll-tabWidth, -1*(containerSize - 5*tabWidth)));
  const scrollTo = (viewId) => setScroll(Math.max(Math.min( tabWidth * viewOrder.indexOf(viewId) , 0), -1*(containerSize - 5*tabWidth)));

  useOutsideClick([tabListRef, tabListBtnRef], openTabList, () => setOpenTabList(false));

  // DISPLAY ELEMENTS
  let viewTabs = [];
  let tabList = [];
  if (viewCollection) {
    for (let x in viewOrder) {
      let viewId = viewOrder[x];
      if (viewCollection[viewId]) {
        viewTabs = [
          ...viewTabs,
          <Tab key={viewId} 
            viewId={viewId} 
            tabsContainerRef={tabsContainerRef} tabWidth={tabWidth} />
        ];
        tabList = [
          ...tabList,
          [viewCollection[viewId].title, () => {
            dispatch(actions.updActiveViewId(viewId));
            scrollTo(viewId)}]
        ];
      }
    }
  }

  return (
    <div className="tab-bar">
      {/* buttons & tab list*/}
      <div className="btn-container">
        {/* add tab */}
        <button className="add-tab btn-32" 
          onClick={() => dispatch(actions.createView())}>
          <img src={AddImg} alt="Add Tab" draggable="false" />
          <span className="tooltip">Add tab</span>
        </button>
        <div className="gap" />
        {/* view select button */}
        <button ref={tabListBtnRef} className="show-tablist btn-32"
          onClick={() => setOpenTabList(!openTabList)}>
          <img src={MenuImg} alt="Select Tab" draggable="false" />
          <span className="tooltip">Tab select</span>
        </button>
        <div className="gap" />
        {/* scroll left */}
        <button className="view-scroll-left btn-32" onClick={scrollLeft}>
          <img src={LeftArrowImg} alt="Scroll left" draggable="false" />
          <span className="tooltip">Scroll left</span>
        </button>
        <div className="gap" />
        {/* scroll right */}
        <button className="view-scroll-right btn-32" onClick={scrollRight}>
          <img src={RightArrowImg} alt="Scroll right" draggable="false" />
          <span className="tooltip">Scroll right</span>
        </button>
        
        {/* tab list */}
        <div ref={tabListRef} className="tablist-container"
          style={openTabList ? {transform: `translateY(-100%) translateY(-44px)`} : null}>
          <Menu options={tabList} />
        </div>
      </div>

      {/* view tabs */}
      <div ref={tabsContainerRef} className="tabs-container"
        onWheel={wheelHandler}>
        <div className="scroll-container" 
          style={{width: containerSize, transform: `translateX(${scroll}px)`}}>
          {viewTabs}
        </div>
        <div className="border-line" />
      </div>
    </div>
  );
});

export default TabBar;