import { useDispatch, useSelector } from 'react-redux';

import { actions } from '../../data/redux';

export const useToolMenuHooks = () => {
  const dispatch = useDispatch();
  const activeCard = useSelector(state => state.session.activeCardId);
  const activeTab = useSelector(state => state.project.present.activeViewId);

  const disableNewCard = !activeTab;
  const disableCopyCard = !activeCard || !activeCard;

  return {
    onClickNewCard: () => {
      if (!disableNewCard) {
        dispatch(actions.project.createCard());
      }
    },
    disableNewCard,
    onClickCopyCard: () => {
      if (!disableCopyCard) {
        dispatch(actions.project.copyCard({ id: activeCard }));
      }
    },
    disableCopyCard,
  };
};
