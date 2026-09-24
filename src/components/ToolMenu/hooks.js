import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '../../data/redux';
import { createNewCard, copySelectedCard, copySelectedCards, destroySelectedCards } from '../../data/redux/thunkActions';
import { POPUP_KEYS } from '../Popup/PopupKey';

import { DEFAULT_CARD_OFFSET } from '../../constants/dimensions';
import { CARD_TYPES, hasCardContent } from '../../constants/cards';
import { getGroupedPositions } from '../../utils/gridUtils';

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

// Requires a real 2+ card multi-selection - unlike copy/delete, grouping a
// single card is meaningless, so this deliberately does NOT fall back to
// the single active card.
export const useGroupCardsHooks = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectors.project.activeTab);
  const selectedCards = useSelector(selectors.session.selectedCards);
  const selectedCardsData = useSelector(selectors.project.selectedCardsData);

  const disableGroupCards = !activeTab || !selectedCardsData || selectedCardsData.length < 2;

  return {
    disableGroupCards,
    onClickGroupCards: () => {
      if (disableGroupCards) return;
      // selectedCardsData is built by zipping selectedCards (ids) against
      // state.project.cards in the same order - card objects have no own
      // `id` field, so pairing back up by index is required (same as
      // useDeleteCardsHooks's ids/cards pairing).
      const cards = selectedCards
        .map((id, i) => ({ id, view: selectedCardsData[i]?.views?.[activeTab] }))
        .filter(c => c.view)
        .map(c => ({ id: c.id, pos: c.view.pos, size: c.view.size }));
      if (cards.length < 2) return;
      dispatch(actions.project.setCardPositions({ positions: getGroupedPositions(cards) }));
    },
  };
};

// Enabled whenever the active tab has any cards at all - unlike copy/
// delete/group, this never depends on the CURRENT selection.
export const useSelectAllHooks = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectors.project.activeTab);
  const activeTabCardsDimensions = useSelector(selectors.project.activeTabCardsDimensions);
  const cardIds = Object.keys(activeTabCardsDimensions);

  const disableSelectAll = !activeTab || cardIds.length === 0;

  return {
    disableSelectAll,
    onClickSelectAll: () => {
      if (disableSelectAll) return;
      dispatch(actions.session.setSelectedCards({ cards: cardIds }));
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
  const { disableGroupCards, onClickGroupCards } = useGroupCardsHooks();
  const { disableSelectAll, onClickSelectAll } = useSelectAllHooks();

  const [ offset, setOffset ] = useState(0);
  const offsetTimerRef = useRef(null);

  const disableNewMonsterCard = !activeTab;
  const disableNewNoteCard = !activeTab;
  const disableNewCustomCard = !activeTab;
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
    disableNewNoteCard,
    onClickNewNoteCard: () => {
      if (!disableNewNoteCard) {
        dispatch(createNewCard({
          activeTabPosition,
          offset,
          type: CARD_TYPES.note,
        }));
        setOffset(offset + DEFAULT_CARD_OFFSET);
      }
    },
    disableNewCustomCard,
    onClickNewCustomCard: () => {
      if (!disableNewCustomCard) {
        dispatch(createNewCard({
          activeTabPosition,
          offset,
          type: CARD_TYPES.custom,
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
    disableSelectAll,
    onClickSelectAll,
    disableGroupCards,
    onClickGroupCards,
    disableDeleteCards,
    onClickDeleteCards,
  };
};
