import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectors } from '../../data/redux';
import { createNewCard, copySelectedCard, copySelectedCards } from '../../data/redux/thunkActions';

import { DEFAULT_CARD_OFFSET } from '../../constants/dimensions';

const OFFSET_TIMEOUT = 3000;

export const useToolMenuHooks = () => {
  const dispatch = useDispatch();
  const activeCard = useSelector(selectors.session.activeCard);
  const activeTab = useSelector(selectors.project.activeTab);
  const activeCardData = useSelector(selectors.project.activeCardData);
  const selectedCardsData = useSelector(selectors.project.selectedCardsData);
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);

  const [ offset, setOffset ] = useState(0);
  const offsetTimerRef = useRef(null);

  const disableNewCard = !activeTab;
  const disableCopyCard = !activeCard || !activeTab;
  const disableCopyCards = (selectedCardsData && selectedCardsData.length === 0) || !activeTab;

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
    disableCopyCard,
    onClickCopyCard: () => {
      if (!disableCopyCard) {
        dispatch(copySelectedCard({
          selectedCard: activeCardData,
          activeTab,
        }));
      }
    },
    disableCopyCards,
    onClickCopyCards: () => {
      if (!disableCopyCards) {
        dispatch(copySelectedCards({
          selectedCards: selectedCardsData,
          activeTab,
        }));
      }
    },
  };
};
