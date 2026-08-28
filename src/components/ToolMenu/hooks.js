import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectors } from '../../data/redux';
import { createNewCard, copySelectedCard, copySelectedCards } from '../../data/redux/thunkActions';

import { DEFAULT_CARD_OFFSET } from '../../constants/dimensions';

const OFFSET_TIMEOUT = 3000;

export const useToolMenuHooks = () => {
  const dispatch = useDispatch();
  const activeTab = useSelector(selectors.project.activeTab);
  const activeCardData = useSelector(selectors.project.activeCardData);
  const selectedCardsData = useSelector(selectors.project.selectedCardsData);
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);

  const [ offset, setOffset ] = useState(0);
  const offsetTimerRef = useRef(null);

  const disableNewCard = !activeTab;
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
  };
};
