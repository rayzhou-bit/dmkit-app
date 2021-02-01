import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';

import AddImg from '../../assets/icons/add-32.png';
import CopyImg from '../../assets/icons/copy-32.png';
import SaveImg from '../../assets/icons/save-32.png';

const ToolMenu = React.memo(props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STORE VALUES
  const dataManager = useSelector(state => state.dataManager);
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const activeCardId = useSelector(state => state.dataManager.activeCardId);
  const activeViewId = campaignColl[campaignId] ? campaignColl[campaignId].activeViewId : null;
  const cardCreateCnt = campaignColl[campaignId] ? campaignColl[campaignId].cardCreateCnt : null;

  // FUNCTIONS
  const createCard = () => dispatch(actions.createCard(campaignId, activeViewId, cardCreateCnt)); 
  // IMPLEMENT: set cursor to the card title after card creation

  const copyCard = () => {
    if (activeCardId) {
      dispatch(actions.copyCard(campaignId, cardColl[activeCardId], activeViewId, cardCreateCnt));
    }
  };

  const saveEditedData = () => {
    dispatch(actions.sendCampaignData(campaignId, campaignColl, cardColl, viewColl, dataManager));
  };

  return (
    <div id="tool-menu" ref={toolMenuRef}>
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