import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';

import AddImg from '../../media/icons/add.png';
import CopyImg from '../../media/icons/copy.png';
import SaveImg from '../../media/icons/save.png';

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
  const createCard = () => dispatch(actions.createCard(cardCreateCnt, activeViewId)); 
  // IMPLEMENT: set cursor to the card title after card creation

  const copyCard = () => {
    if (activeCardId) {
      dispatch(actions.copyCard(cardColl[activeCardId], activeViewId, cardCreateCnt));
    }
  };

  const saveEditedData = () => {
    dispatch(actions.sendCampaignData(campaignId, campaignColl, cardColl, viewColl, dataManager));
  };

  // STYLES
  const topOffset = 50;
  const buttonHeight = 30 + 11;
  const dividerHeight = 30 / 4;

  return (
    <div id="toolMenu" ref={toolMenuRef}>
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