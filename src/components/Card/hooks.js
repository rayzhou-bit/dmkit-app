
// FUNCTIONS: CARD
const dragStopHandler = (event, data) => {
  setDragging(false);
  if (cardPos) {
    if (cardPos.x !== data.x || cardPos.y !== data.y) dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
  } else dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
};

const resizeStopHandler = (event, direction, ref, delta, position) => {
  if (delta.width !== 0 || delta.height !== 0) {
    dispatch(actions.updCardSize(cardId, {width: ref.style.width, height: ref.style.height}));
    if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
        dispatch(actions.updCardPos(cardId, {x: position.x, y: position.y}));
    }
  }
};