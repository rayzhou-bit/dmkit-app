import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';
import Button from './Button/Button';

import AddImg from '../../assets/icons/add-32.png';
import CopyImg from '../../assets/icons/copy-32.png';

const ToolMenu = props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STORE VALUES
  const userId = useSelector(state => state.userData.userId);
  const status = useSelector(state => state.sessionManager.status);
  const campaignEdit = useSelector(state => state.sessionManager.campaignEdit);
  const introCampaignEdit = useSelector(state => state.sessionManager.introCampaignEdit);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const activeViewLock = useSelector(state => activeViewId ? state.campaignData.present.views[activeViewId].lock : null);
  const campaignData = useSelector(state => state.campaignData.present);

  return (
    <div className="tool-menu" ref={toolMenuRef}>
      {/* new card */}
      <Button pos={0} disabled={!activeViewId}
        img={AddImg} name={"new"} tooltip={"New Card"} 
        clicked={() => dispatch(actions.createCard())}
      />
      {/* copy card */}
      <Button pos={1} disabled={!activeViewId || !activeCardId}
        img={CopyImg} name={"copy"} tooltip={"Copy Card"}
        clicked={() => dispatch(actions.copyCard(activeCardId))}
      />
    </div>
  );
};

export default ToolMenu;