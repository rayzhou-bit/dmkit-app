import React, { useRef } from 'react';
import { Rnd } from 'react-rnd';

import { useCanvasHooks, useCardsHooks, useMultiSelectHooks } from './hooks';
import Card from '../Card/Card';

import { CANVAS_STATES } from '../../constants/states';
import { GRID_SIZE, CANVAS_SIZE } from '../../constants/dimensions';

import './index.scss';
import BookIcon from '../../assets/icons/book.svg';
import PlusIcon from '../../assets/icons/plus.svg'

// Canvas is the main portion the user is looking at. This is located in the center of the screen.

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
  const canvasRef = useRef();
  const selectRef = useRef();

  const {
    canvasState,
    canvasPosition,
    canvasScale,
    isPanning,
    beginPanning,
    endPanning,
    mouseMoveHandler,
    wheelHandler,
    createNewProject,
  } = useCanvasHooks();

  const {
    cardArgs,
    cardDropHandler,
  } = useCardsHooks();

  const {
    selectStyle,
  } = useMultiSelectHooks({
    canvasRef,
    selectRef,
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
        <div
          className='canvas-container'
          onMouseDown={beginPanning}
          onMouseUp={endPanning}
          onMouseLeave={endPanning}
          onMouseMove={mouseMoveHandler}
          onWheel={wheelHandler}
          style={{
            cursor: isPanning ? 'grabbing' : 'auto',
          }}
        >
          <div
            className='canvas'
            onDragOver={(e) => e.preventDefault()}
            onDrop={cardDropHandler}
            style={{
              width: `${CANVAS_SIZE.width}px`,
              height: `${CANVAS_SIZE.height}px`,
              backgroundPosition: `${GRID_SIZE / 2}px ${GRID_SIZE / 2}px`,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              transition: isPanning ? 'none' : 'transform 0.3s',
              transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${canvasScale})`,
            }}
            ref={canvasRef}
          >
            <div
              className='selection-area'
              ref={selectRef}
              style={selectStyle}
            />
            {cardList}
          </div>
        </div>
        // <div
        //   className='scaling-div'
        //   onMouseMove={mouseMoveHandler}
        //   style={{
        //     transform: `scale(${canvasScale})`,
        //     transformOrigin: `${canvasOrigin.x} ${canvasOrigin.y}`,
        //   }}
        //   ref={canvasRef}
        // >
        //   <Rnd
        //     allowAnyClick={true}
        //     dragHandleClassName='dragging-div'
        //     enableResizing={false}
        //     onDragStop={dragStopHandler}
        //     position={canvasPosition}
        //     scale={canvasScale}
        //     size={CANVAS_SIZE}
        //   >
        //     <div
        //       className='selection-area'
        //       ref={selectRef}
        //       style={selectStyle}
        //     />
        //     <div
        //       className='view'
        //       id='view'
        //       onDragOver={(e) => e.preventDefault()}
        //       onDrop={cardDropHandler}
        //       onMouseDown={mouseFilterHandler}
        //     >
        //       <div className='dragging-div' />
        //       <div
        //         className='grid'
        //         style={{
        //           backgroundPosition: `${GRID_SIZE / 2}px ${GRID_SIZE / 2}px`,
        //           backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        //         }}
        //       />
        //       {cardList}
        //     </div>
        //   </Rnd>
        // </div>
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
