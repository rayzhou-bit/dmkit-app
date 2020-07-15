import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';

const ToolMenu = React.memo(props => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cardColl = useSelector(state => state.card);
  const cardDelete = useSelector(state => state.cardManage.cardDelete);
  const viewColl = useSelector(state => state.view);
  const viewOrder = useSelector(state => state.viewManage.viewOrder);
  const viewDelete = useSelector(state => state.viewManage.viewDelete);
  const activeView = useSelector(state => state.viewManage.activeView);

  const setCardCreate = () => dispatch(actions.setCardCreate(user, campaign, activeView));
  const saveEditedData = () => {
    dispatch(actions.saveCards(user, campaign, cardColl, cardDelete));
    dispatch(actions.saveViews(user, campaign, viewColl, viewDelete, viewOrder));
  };

  return (
    <div id="toolMenu">
      <button onClick={setCardCreate}>+</button>
      <button onClick={saveEditedData}>S</button>
    </div>
  );
});

export default ToolMenu;