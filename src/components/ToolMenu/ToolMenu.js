import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';

import AddImg from '../../assets/icons/add-32.png';
import CopyImg from '../../assets/icons/copy-32.png';
import SaveImg from '../../assets/icons/save-32.png';

const ToolMenu = React.memo(props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STORE VALUES
  const userId = useSelector(state => state.userData.userId);
  const status = useSelector(state => state.sessionManager.status);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignData = useSelector(state => state.campaignData)
  const activeCardId = useSelector(state => state.campaignData.activeCardId);

  // FUNCTIONS
  const createCard = () => dispatch(actions.createCard(activeCampaignId));

  const copyCard = () => {
    if (activeCardId) {
      dispatch(actions.copyCard(activeCardId));
    }
  };

  const saveEditedData = () => {
    if ((status=== 'idle') && userId && activeCampaignId) {
      dispatch(actions.setStatus('saving'));
      dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData,
        () => dispatch(actions.setStatus('idle'))
      ));
    }
  };

  return (
    <div className="tool-menu" ref={toolMenuRef}>
      <div className="divider" />
      <div className="create-card button" onClick={createCard}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">Add a card</span>
      </div>
      <div className="copy-card button" onClick={copyCard}>
        <img src={CopyImg} alt="Copy" draggable="false" />
        <span className="tooltip">Copy selected card</span>
      </div>
      <div className="divider" />
      <div className="save-campaign button" onClick={saveEditedData}>
        <img src={SaveImg} alt="Save" draggable="false" />
        <span className="tooltip">Save project</span>
      </div>
      <div className="divider" />
    </div>
  );
});

export default ToolMenu;