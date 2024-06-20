import { actions } from '../../data/redux';
import generateUID from '../../utils/generateUID';
import { getNearestGrid, getValidPositionAndSize } from '../../utils/gridUtils';
import { NEW_CARD_POSITION, NEW_CARD_SIZE, NEW_CARD_OFFSET } from '../../constants/dimensions';

export const createNewCard = ({
  activeTabPosition,
  offset,
}) => dispatch => {
  const newId = generateUID('card');
  let {
    position,
    size,
  } = getValidPositionAndSize({
    position: getNearestGrid({
      x: NEW_CARD_POSITION.x - activeTabPosition.x + (offset ?? 0),
      y: NEW_CARD_POSITION.y - activeTabPosition.y + (offset ?? 0),
    }),
    size: NEW_CARD_SIZE,
  });
  dispatch(actions.project.createCard({
    newId,
    position,
    size,
  }));
  dispatch(actions.session.setActiveCard({ id: newId }));
};

export const copySelectedCard = ({
  selectedCard,
  activeTab,
}) => dispatch => {
  const newId = generateUID('card');
  const position = {
    x: (selectedCard?.views[activeTab]?.pos?.x ?? 0) + NEW_CARD_OFFSET,
    y: (selectedCard?.views[activeTab]?.pos?.y ?? 0) + NEW_CARD_OFFSET,
  };
  dispatch(actions.project.createCard({
    newId,
    position,
    size: selectedCard?.views[activeTab]?.size,
    color: selectedCard?.color,
    title: selectedCard?.title,
    text: selectedCard?.content?.text,
  }));
  dispatch(actions.session.setActiveCard({ id: newId }));
};
