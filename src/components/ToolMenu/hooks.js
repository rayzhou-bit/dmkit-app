import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '../../data/redux';
import generateUID from '../../utils/generateUID';
import { GRID_SIZE, CANVAS_SIZE, NEW_CARD_POSITION, NEW_CARD_SIZE } from '../../constants/dimensions';

const calcNearestGrid = ({ x, y }) => {
  const newX = Math.round(x / GRID_SIZE) * GRID_SIZE;
  if (newX < 0) {
    newX = 0;
  }
  if (newX > CANVAS_SIZE.width) {
    newX = CANVAS_SIZE.width - (5 * GRID_SIZE);
  }
  const newY = Math.round(y / GRID_SIZE) * GRID_SIZE;
  if (newY < 0) {
    newY = 0;
  }
  if (newY > CANVAS_SIZE.height) {
    newY = CANVAS_SIZE.height - (5 * GRID_SIZE);
  }
  
  return {
    x: newX,
    y: newY,
  };
};

export const useToolMenuHooks = () => {
  const dispatch = useDispatch();
  const activeCard = useSelector(state => state.session.activeCardId);
  const activeTab = useSelector(state => state.project.present.activeViewId);
  // const activeCardPosition = useSelector(selectors.project.activeCardPosition);
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);

  const disableNewCard = !activeTab;
  const disableCopyCard = !activeCard || !activeCard;

  return {
    onClickNewCard: () => {
      if (!disableNewCard) {
        const newId = generateUID('card');
        let position = calcNearestGrid({
          x: NEW_CARD_POSITION.x - activeTabPosition.x,
          y: NEW_CARD_POSITION.y - activeTabPosition.y,
        });
        if (position.x + NEW_CARD_SIZE.width > CANVAS_SIZE.width) {
          position.x = CANVAS_SIZE.width - NEW_CARD_SIZE.width;
        }
        if (position.y + NEW_CARD_SIZE.height > CANVAS_SIZE.height) {
          position.y = CANVAS_SIZE.height - NEW_CARD_SIZE.height;
        }
        // if (position.x === activeCardPosition?.x && position.y === activeCardPosition?.y) {
        //   position = {
        //     x: position.x + GRID_SIZE,
        //     y: position.y + GRID_SIZE,
        //   };
        //   console.log('trig', position)
        // }
        dispatch(actions.project.createCard({
          newId,
          position,
        }));
        dispatch(actions.session.setActiveCard({ id: newId }));
      }
    },
    disableNewCard,
    onClickCopyCard: () => {
      if (!disableCopyCard) {
        const newId = generateUID('card');
        dispatch(actions.project.copyCard({ id: activeCard, newId }));
        dispatch(actions.session.setActiveCard({ id: newId }));
      }
    },
    disableCopyCard,
  };
};
