import React from 'react';

import { useTabBarHooks } from './hooks';
import TabControls from './TabControls';
import Tab from './Tab';

import './index.scss';
import ScrollLeftIcon from '../../assets/icons/scroll-left.svg';
import ScrollRightIcon from '../../assets/icons/scroll-right.svg';

const TabBar = () => {
  const {
    tabs,
    containerRef,
    position,
    scrollLeft,
    scrollRight,
    scrollTo,
    onWheel,
  } = useTabBarHooks();

  const tabList = tabs.map(tab => <Tab id={tab} />);

  return (
    <div className="tab-bar">
      <TabControls scrollTo={scrollTo} />
      <div
        className='tab-container'
        onWheel={(event) => onWheel(event)}
        ref={containerRef}
      >
        <div
          className='tab-scroll-container'
          style={{ left: position }}
        >
          {tabList}
        </div>
      </div>
      <div className='tab-scroll'>
        <button
          className='scroll'
          onClick={scrollLeft}
        >
          <img src={ScrollLeftIcon} />
        </button>
        <button
          className='scroll'
          onClick={scrollRight}
        >
          <img src={ScrollRightIcon} />
        </button>
      </div>
    </div>
  );
};

export default TabBar;