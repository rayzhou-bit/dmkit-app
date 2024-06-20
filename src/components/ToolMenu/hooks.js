import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectors } from '../../data/redux';
import { copySelectedCard, createNewCard } from '../../data/redux/thunkActions';

import { NEW_CARD_OFFSET } from '../../constants/dimensions';

const OFFSET_TIMEOUT = 3000;

export const useToolMenuHooks = () => {
  const dispatch = useDispatch();
  const activeCard = useSelector(selectors.session.activeCard);
  const activeTab = useSelector(selectors.project.activeTab);
  const activeCardData = useSelector(selectors.project.activeCardData);
  const activeTabPosition = useSelector(selectors.project.activeTabPosition);
  const [ offset, setOffset ] = useState(0);
  const offsetTimerRef = useRef(null);

  const disableNewCard = !activeTab;
  const disableCopyCard = !activeCard || !activeCard;

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
    onClickNewCard: () => {
      if (!disableNewCard) {
        dispatch(createNewCard({ activeTabPosition, offset }));
        setOffset(offset + NEW_CARD_OFFSET);
      }
    },
    disableNewCard,
    onClickCopyCard: () => {
      if (!disableCopyCard) {
        dispatch(copySelectedCard({
          selectedCard: activeCardData,
          activeTab,
        }));
      }
    },
    disableCopyCard,
  };
};
