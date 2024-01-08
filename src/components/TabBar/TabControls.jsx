import React from 'react';

import { useTabControlsHooks } from './hooks';

import './index.scss';
import AddIcon from '../../assets/icons/add-tab.svg';
import MenuIcon from '../../assets/icons/tab-menu.svg';

const TabControls = ({
  scrollTo,
}) => {
  const {
    newTab,
    btnRef,
    dropupRef,
    showOverviewDropup,
    openOverviewDropup,
    closeOverviewDropup,
    activeTab,
    tabs,
    tabData,
    switchTab,
  } = useTabControlsHooks({ scrollTo });

  let tabList = tabs.map(tab => {
    if (tab !== activeTab) {
      const name = tabData[tab]?.title || 'Unnamed Tab';
      return (
        <li key={tab}>
          <div onClick={() => switchTab(tab)} title={name}>
            <span>{name}</span>
          </div>
        </li>
      );
    }
  });
  if (activeTab) {
    const name = tabData[activeTab]?.title || 'Unnamed Tab';
    tabList = [
      ...tabList,
      <li key={activeTab}>
        <div className='active' title={name}>
          <span>{name}</span>
        </div>
      </li>,
    ];
  }

  return (
    <div className='tab-controls'>
      <button className='add-button' onClick={newTab}>
        <img src={AddIcon} />
        <span className="tooltip">New tab</span>
      </button>
      <button
        className='overview-button'
        onClick={showOverviewDropup ? closeOverviewDropup : openOverviewDropup}
        ref={btnRef}
      >
        <img src={MenuIcon} />
        <span className="tooltip">Tab Overview</span>
      </button>
      <div
        className='tab-dropup'
        ref={dropupRef}
        style={{ display: showOverviewDropup ? 'block' : 'none' }}
      >
        <ul>
          {tabList}
        </ul>
      </div>
    </div>
  );
};

export default TabControls;