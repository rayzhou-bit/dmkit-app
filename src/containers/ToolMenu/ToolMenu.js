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

  // VARIABLES
  const userId = actions.getUserId();
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const campaignData = campaignColl[campaignId];
  const activeViewId = campaignData.activeViewId;
  const activeCardId = useSelector(state => state.dataManager.activeCardId);
  const cardCreateCnt = campaignData.cardCreateCnt;

  // FUNCTIONS
  const setCardCreate = () => dispatch(actions.setCardCreate(cardCreateCnt, activeViewId));

  const setCardCopy = () => {
    if (activeCardId) {
      dispatch(actions.setCardCopy(cardColl[activeCardId], activeViewId, cardCreateCnt));
    }
  };

  const saveEditedData = () => {
    if (userId) {
      // dispatch(actions.saveCampaignDataToServer(campaignId, campaignColl, cardColl, viewColl, cardManager, viewManager));
    } else {
      // IMPLEMENT: ask for player log in or sign up
    }
  };

  // STYLES
  const topOffset = 50;
  const buttonHeight = 30 + 11;
  const dividerHeight = 30 / 4;

  return (
    <div id="toolMenu" ref={toolMenuRef}>
      <div className="divider" />
      <div className="create-card button" onClick={setCardCreate}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">Add a card</span>
      </div>
      <div className="copy-card button" onClick={setCardCopy}>
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