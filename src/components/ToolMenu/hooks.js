import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '../../data/redux';
import { createNewCard, copySelectedCard, copySelectedCards, destroySelectedCards } from '../../data/redux/thunkActions';
import { POPUP_KEYS } from '../Popup/PopupKey';

import { DEFAULT_CARD_OFFSET } from '../../constants/dimensions';
import { CARD_TYPES, hasCardContent } from '../../constants/cards';

const OFFSET_TIMEOUT = 3000;

const hasContent = (card) => hasCardContent(card?.content);

// Shared by the ToolMenu delete button and the Delete/Backspace shortcut, so
// the confirm-vs-immediate decision can't diverge between the two.
export const useDeleteCardsHooks = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectors.project.activeTab);
  const activeCardData = useSelector(selectors.project.activeCardData);
  const activeCardId = useSelector(selectors.session.activeCard);
  const selectedCards = useSelector(selectors.session.selectedCards);
  const selectedCardsData = useSelector(selectors.project.selectedCardsData);

  const hasSelection = !!(selectedCardsData && selectedCardsData.length > 0);
  const disableDeleteCards = !activeTab || (!hasSelection && !activeCardData);

  return {
    disableDeleteCards,
    onClickDeleteCards: () => {
      if (disableDeleteCards) return;
      const ids = hasSelection ? selectedCards : [activeCardId];
      const cards = hasSelection ? selectedCardsData : [activeCardData];
      if (cards.some(hasContent)) {
        dispatch(actions.session.setPopup({ type: POPUP_KEYS.confirmCardsDelete, ids }));
      } else {
        dispatch(destroySelectedCards({ ids, activeCardId }));
      }
    },
  };
};

export const useToolMenuHooks = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectors.project.activeTab);
  const activeCardData = useSelector(selectors.project.activeCardData);
  const selectedCardsData = useSelector(selectors.project.selectedCardsData);
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);

  const { disableDeleteCards, onClickDeleteCards } = useDeleteCardsHooks();

  const [ offset, setOffset ] = useState(0);
  const offsetTimerRef = useRef(null);

  const disableNewCard = !activeTab;
  const disableNewImageCard = !activeTab;
  const disableNewMonsterCard = !activeTab;
  const disableNewLocationCard = !activeTab;
  // Copy uses the multi-selection when there is one, otherwise falls back
  // to the single active card (a plain click doesn't add to selectedCards).
  const hasSelection = !!(selectedCardsData && selectedCardsData.length > 0);
  const disableCopyCards = !activeTab || (!hasSelection && !activeCardData);

  useEffect(() => {
    if (offset > 0) {
      clearInterval(offsetTimerRef.current);
      offsetTimerRef.current = setInterval(() => {
        setOffset(0);
      }, OFFSET_TIMEOUT);
    }
    return () => clearInterval(offsetTimerRef.current);
  }, [offset])

  return {
    disableNewCard,
    onClickNewCard: () => {
      if (!disableNewCard) {
        dispatch(createNewCard({
          activeTabPosition,
          offset,
        }));
        setOffset(offset + DEFAULT_CARD_OFFSET);
      }
    },
    disableNewImageCard,
    onClickNewImageCard: () => {
      if (!disableNewImageCard) {
        dispatch(createNewCard({
          activeTabPosition,
          offset,
          type: CARD_TYPES.image,
        }));
        setOffset(offset + DEFAULT_CARD_OFFSET);
      }
    },
    disableNewMonsterCard,
    onClickNewMonsterCard: () => {
      if (!disableNewMonsterCard) {
        dispatch(createNewCard({
          activeTabPosition,
          offset,
          type: CARD_TYPES.monster,
        }));
        setOffset(offset + DEFAULT_CARD_OFFSET);
      }
    },
    disableNewLocationCard,
    onClickNewLocationCard: () => {
      if (!disableNewLocationCard) {
        dispatch(createNewCard({
          activeTabPosition,
          offset,
          type: CARD_TYPES.location,
        }));
        setOffset(offset + DEFAULT_CARD_OFFSET);
      }
    },
    disableCopyCards,
    onClickCopyCards: () => {
      if (disableCopyCards) return;
      if (hasSelection) {
        dispatch(copySelectedCards({
          selectedCards: selectedCardsData,
          activeTab,
        }));
      } else {
        dispatch(copySelectedCard({
          selectedCard: activeCardData,
          activeTab,
        }));
      }
    },
    disableDeleteCards,
    onClickDeleteCards,
  };
};
