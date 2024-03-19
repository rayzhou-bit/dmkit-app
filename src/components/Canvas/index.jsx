import React from 'react';
import { Rnd } from 'react-rnd';

import { CANVAS_STATES, CANVAS_DIMENSIONS, useCanvasHooks } from './hooks';
import Card from '../Card/Card';

import { GRID } from '../../shared/constants';
import './index.scss';
import LibraryIcon from '../../assets/icons/library.svg';
import PlusIcon from '../../assets/icons/plus.svg'

// Canvas is the main portion the user is looking at. This is located in the center of the screen.

const Empty = (createNewProject) => (
  <div className='empty'>
    <img src={LibraryIcon} />
    <div className='container1'>
      <span className='header'>No projects open</span>
      <div className='container2'>
        <span className='text'>Please click below to get started or select</span>
        <span className='text'>an existing project from the top menu</span>
      </div>
    </div>
    <button className='button' onClick={createNewProject}>
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
  const {
    canvasState,
    canvasPosition,
    canvasScale,
    cardArgs,
    dragStopHandler,
    wheelHandler,
    cardDropHandler,
    createNewProject,
  } = useCanvasHooks();

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
        <div
          className='scale-view'
          style={{ transform: 'scale('+canvasScale+')'}}
        >
          <Rnd
            allowAnyClick={true}
            dragHandleClassName='drag-view'
            enableResizing={false}
            onDragStop={dragStopHandler}
            position={canvasPosition}
            scale={canvasScale}
            size={CANVAS_DIMENSIONS}
          >
            <div
              className='view'
              onDragOver={(e) => e.preventDefault()}
              onDrop={cardDropHandler}
            >
              <div className='drag-view' />
              {cardList}
              <div
                className='grid'
                style={{ backgroundSize: GRID.size + ' ' + GRID.size }}
              />
            </div>
          </Rnd>
        </div>
      );
      break;
  }

  return (
    <main
      className='view-screen'
      onWheel={wheelHandler}
      onContextMenu={(e) => e.preventDefault()}
    >
      {display}
    </main>
  );
};

export default Canvas;
