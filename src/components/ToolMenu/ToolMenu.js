import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';

const ToolMenu = React.memo(props => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cards = useSelector(state => state.cards.cards);
  const views = useSelector((state) => state.views.views);
  const viewOrder = useSelector((state) => state.views.viewOrder);
  const viewDelete = useSelector((state) => state.views.viewDelete);
  const activeView = useSelector(state => state.views.activeView);

  const createCard = () => dispatch(actions.createCard(user, campaign, activeView));
  const saveEditedData = () => {
    dispatch(actions.saveEditedCardData(user, campaign, cards));
    dispatch(actions.saveEditedViewData(user, campaign, views, viewOrder, viewDelete));
  };

  return (
    <div id="toolMenu">
      <button onClick={createCard}>+</button>
      <button onClick={saveEditedData}>S</button>
    </div>
  );
});

export default ToolMenu;