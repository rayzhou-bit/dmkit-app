import React, { useRef } from 'react';

import { useCanvasHooks, useCardsHooks, useMultiSelectHooks } from './hooks';
import Card from '../Card/Card';
import ZoomControls from './ZoomControls';

import { CANVAS_STATES } from '../../constants/states';
import { GRID_SIZE, CANVAS_SIZE } from '../../constants/dimensions';

import './index.scss';
import BookIcon from '../../assets/icons/book.svg';
import PlusIcon from '../../assets/icons/plus.svg'

// *****
// Canvas is the main portion of the screen the user uses.
// This is located in the center of the screen.
// It contains cards that can be moved around.
// *****

const Empty = (createNewProject) => (
  <div className='empty'>
    <img src={BookIcon} />
    <div className='container1'>
      <span className='header'>No projects open</span>
      <div className='container2'>
        <span className='text'>Please click below to get started or select</span>
        <span className='text'>an existing project from the top menu</span>
      </div>
    </div>
    <button className='new-proj-btn' onClick={createNewProject}>
      <span>Create new</span>
      <img src={PlusIcon} />
    </button>
  </div>
);

const Loading = () => (
  <div className='loading'>
    <div className='bar-container'>
      <div className='bar' />
    </div>
  </div>
);

const Canvas = ({ toolMenuRef }) => {
  const containerRef = useRef();
  const canvasRef = useRef();
  const selectRef = useRef();

  const {
    canvasState,
    isPanning,
    isPanModifierHeld,
    panModifierRef,
    displayScale,
    zoomIn,
    zoomOut,
    resetView,
    canZoomIn,
    canZoomOut,
    createNewProject,
  } = useCanvasHooks({ containerRef, canvasRef });

  const {
    cardArgs,
    cardDropHandler,
  } = useCardsHooks({ containerRef });

  const {
    selectStyle,
  } = useMultiSelectHooks({
    containerRef,
    canvasRef,
    selectRef,
    panModifierRef,
  });

  let cardList = [];
  for (let card in cardArgs) {
    cardList = [
      cardList,
      <Card toolMenuRef={toolMenuRef} {...cardArgs[card]} />
    ];
  }

  let display = <div/>;
  switch (canvasState) {
    case CANVAS_STATES.empty:
      display = Empty(createNewProject);
      break;
    case CANVAS_STATES.loading:
      display = Loading();
      break;
    case CANVAS_STATES.loaded:
      display = (
        <>
          <div
            className={`canvas-container${isPanModifierHeld ? ' pan-mode' : ''}${isPanning ? ' panning' : ''}`}
            ref={containerRef}
          >
            <div
              className='canvas'
              onDragOver={(e) => e.preventDefault()}
              onDrop={cardDropHandler}
              // TODO maybe change code to use onMouse
              // onMouseDown={beginSelection}
              // onMouseUp={endSelection}
              // onMouseLeave={endSelection}
              // onMouseMove={updateSelection}
              ref={canvasRef}
              style={{
                width: `${CANVAS_SIZE.width}px`,
                height: `${CANVAS_SIZE.height}px`,
                backgroundPosition: `${GRID_SIZE / 2}px ${GRID_SIZE / 2}px`,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              }}
            >
              <div
                className='selection-area'
                ref={selectRef}
                style={selectStyle}
              />
              {cardList}
            </div>
          </div>
          <ZoomControls
            scale={displayScale}
            canZoomIn={canZoomIn}
            canZoomOut={canZoomOut}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetView={resetView}
          />
        </>
      );
      break;
  }

  return (
    <main
      className='view'
      onContextMenu={(e) => e.preventDefault()}
    >
      {display}
    </main>
  );
};

export default Canvas;
