import { actions } from '../../data/redux';
import generateUID from '../../utils/generateUID';
import { getNearestGrid, getValidPositionAndSize } from '../../utils/gridUtils';
import { DEFAULT_CARD_POSITION, DEFAULT_CARD_SIZE, DEFAULT_CARD_OFFSET } from '../../constants/dimensions';

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
      x: DEFAULT_CARD_POSITION.x - activeTabPosition.x + (offset ?? 0),
      y: DEFAULT_CARD_POSITION.y - activeTabPosition.y + (offset ?? 0),
    }),
    size: DEFAULT_CARD_SIZE,
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
    x: (selectedCard?.views[activeTab]?.pos?.x ?? 0) + DEFAULT_CARD_OFFSET,
    y: (selectedCard?.views[activeTab]?.pos?.y ?? 0) + DEFAULT_CARD_OFFSET,
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

export const copySelectedCards = ({
  selectedCards,
  activeTab,
}) => dispatch => {
  for (let cardId in selectedCards) {
    console.log(selectedCards[cardId])
    const selectedCard = selectedCards[cardId];
    const newId = generateUID('card');
    const position = {
      x: (selectedCard?.views[activeTab]?.pos?.x ?? 0) + DEFAULT_CARD_OFFSET,
      y: (selectedCard?.views[activeTab]?.pos?.y ?? 0) + DEFAULT_CARD_OFFSET,
    };
    dispatch(actions.project.createCard({
      newId,
      position,
      size: selectedCard?.views[activeTab]?.size,
      color: selectedCard?.color,
      title: selectedCard?.title,
      text: selectedCard?.content?.text,
    }));
    // dispatch(actions.session.setActiveCard({ id: newId }));
  }
};
