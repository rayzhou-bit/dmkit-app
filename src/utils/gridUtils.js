import { GRID_SIZE, CANVAS_SIZE, NEW_CARD_POSITION, NEW_CARD_SIZE } from '../constants/dimensions';

export const getNearestGrid = ({ x, y }) => {
  let nearestX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  if (nearestX < 0) {
    nearestX = 0;
  }
  if (nearestX > CANVAS_SIZE.width) {
    nearestX = CANVAS_SIZE.width - (5 * GRID_SIZE);
  }

  let nearestY = Math.round(y / GRID_SIZE) * GRID_SIZE;
  if (nearestY < 0) {
    nearestY = 0;
  }
  if (nearestY > CANVAS_SIZE.height) {
    nearestY = CANVAS_SIZE.height - (5 * GRID_SIZE);
  }
  
  return {
    x: nearestX,
    y: nearestY,
  };
};

export const getValidPositionAndSize = ({ position, size }) => {
  let { x, y } = position;
  let { width, height } = size;

  if (width > CANVAS_SIZE.width) {
    width = CANVAS_SIZE.width;
  }

  if (height > CANVAS_SIZE.height) {
    height = CANVAS_SIZE.height;
  }

  if (x < 0) {
    x = 0;
  } else if (x + width > CANVAS_SIZE.width) {
    x = CANVAS_SIZE.width - NEW_CARD_SIZE.width;
  }

  if (y < 0) {
    y = 0;
  } else if (y + height > CANVAS_SIZE.height) {
    y = CANVAS_SIZE.height - NEW_CARD_SIZE.height;
  }

  return {
    position: {
      x,
      y,
    },
    size: {
      width,
      height,
    },
  };
};
