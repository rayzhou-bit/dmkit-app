import React from 'react';

import { TAB_HEIGHT, TAB_WIDTH, POSITION_INCREMENT } from './hooks';

import './index.scss';

const GAP = 1;
const DROP_INDICATOR_WIDTH = POSITION_INCREMENT - TAB_WIDTH - (2 * GAP);

const TabIndicators = ({
  dropIndicatorIndex,
  tabCount,
}) => {
  const tabShadow = (index) => (
    <div key={'shadow' + index} className='tab-shadow' style={{ width: TAB_WIDTH, height: TAB_HEIGHT }} />
  );
  const dropIndicator = (highlight, index) => (
    <div
      key={'drop' + index}
      className='drop-indicator'
      style={{ width: DROP_INDICATOR_WIDTH, height: TAB_HEIGHT, background: highlight ? '#5BC5FF' : 'transparent' }}
    />
  );

  let tabIndicators = [];
  for (let i = 0; i < tabCount; i++) {
    tabIndicators = [
      ...tabIndicators,
      dropIndicator(i === dropIndicatorIndex, i),
      tabShadow(i),
    ];
    if (i === tabCount - 1) {
      tabIndicators = [
        ...tabIndicators,
        dropIndicator(i === dropIndicatorIndex - 1, i + 1),
      ];
    }
  }

  return (
    <div
      className='tab-indicator-container'
      style={{ left: -DROP_INDICATOR_WIDTH - GAP, gap: GAP }}
    >
      {tabIndicators}
    </div>
  );
};

export default TabIndicators;