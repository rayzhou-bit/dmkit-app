import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';

const ToolMenu = React.memo(props => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const activeView = useSelector(state => state.views.activeView);

  const addCard = useCallback(() => dispatch(actions.addCard(user, campaign, activeView)), [user, campaign, activeView]);

  return (
    <div className="ToolMenu">
      <button onClick={addCard}>+</button>
      <button>!</button>
      <button>@</button>
      <button>#</button>
    </div>
  );
});

export default ToolMenu;