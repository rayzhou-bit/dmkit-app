import React from 'react';

import { useTabBarHooks } from './hooks';
import TabControls from './TabControls';
import Tab from './Tab';
import TabIndicators from './TabIndicators';

import './index.scss';
import ScrollLeftIcon from '../../assets/icons/scroll-left.svg';
import ScrollRightIcon from '../../assets/icons/scroll-right.svg';

const TabBar = () => {
  const {
    tabs,
    containerRef,
    position,
    dropIndicatorIndex,
    setDropIndicatorIndex,
    scrollLeft,
    scrollRight,
    scrollTo,
    onWheel,
    isInactiveLeft,
    isInactiveRight,
  } = useTabBarHooks();

  const tabList = tabs.map(tab => <Tab key={tab} id={tab} setDropIndicatorIndex={setDropIndicatorIndex} />);

  return (
    <div className='tab-bar'>
      <TabControls scrollTo={scrollTo} />
      <div
        className='tab-container'
        onWheel={(event) => onWheel(event)}
        ref={containerRef}
      >
        <div
          className='tab-list-container'
          style={{ left: position }}
        >
          {tabList}
          <TabIndicators dropIndicatorIndex={dropIndicatorIndex} tabCount={tabs.length} />
        </div>
      </div>
      <div className='tab-scroll'>
        <button
          className={'scroll' + (isInactiveLeft ? ' inactive' : '')}
          onClick={scrollLeft}
        >
          <img src={ScrollLeftIcon} />
        </button>
        <button
          className={'scroll' + (isInactiveRight ? ' inactive' : '')}
          onClick={scrollRight}
        >
          <img src={ScrollRightIcon} />
        </button>
      </div>
    </div>
  );
};

export default TabBar;