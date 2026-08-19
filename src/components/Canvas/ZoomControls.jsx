import React from 'react';
import { formatZoomPercent } from '../../utils/canvasTransform';
import './index.scss';

const MODIFIER_LABEL = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

const preventDefault = (event) => event.preventDefault();

const ZoomControls = ({
  scale,
  canZoomIn,
  canZoomOut,
  zoomIn,
  zoomOut,
  resetView,
}) => (
  <div className='zoom-controls'>
    <button
      className='zoom-btn'
      disabled={!canZoomOut}
      onMouseDown={preventDefault}
      onClick={zoomOut}
      aria-label='Zoom out'
    >
      −
      <span className='tooltip'>Zoom out ({MODIFIER_LABEL} −)</span>
    </button>
    <button
      className='zoom-value'
      onMouseDown={preventDefault}
      onClick={resetView}
      aria-label='Reset zoom'
    >
      {formatZoomPercent(scale)}
      <span className='tooltip'>Reset zoom ({MODIFIER_LABEL} 0)</span>
    </button>
    <button
      className='zoom-btn'
      disabled={!canZoomIn}
      onMouseDown={preventDefault}
      onClick={zoomIn}
      aria-label='Zoom in'
    >
      +
      <span className='tooltip'>Zoom in ({MODIFIER_LABEL} +)</span>
    </button>
  </div>
);

export default ZoomControls;
