import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';

export const useToolMenuHooks = () => {
  const dispatch = useDispatch();
  const activeCard = useSelector(state => state.sessionManager.activeCardId);
  const activeTab = useSelector(state => state.campaignData.present.activeViewId);

  const disableNewCard = !activeTab;
  const disableCopyCard = !activeCard || !activeCard;

  return {
    onClickNewCard: () => {
      if (!disableNewCard) {
        dispatch(actions.createCard());
      }
    },
    disableNewCard,
    onClickCopyCard: () => {
      if (!disableCopyCard) {
        dispatch(actions.copyCard(activeCard));
      }
    },
    disableCopyCard,
  };
};
