import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';

import AddImg from '../../assets/icons/add-32.png';
import CopyImg from '../../assets/icons/copy-32.png';
import SaveImg from '../../assets/icons/save-32.png';
import AlertImg from '../../assets/icons/alert-32.png';

const ToolMenu = props => {
  const {toolMenuRef} = props;
  const dispatch = useDispatch();

  // STORE VALUES
  const userId = useSelector(state => state.userData.userId);
  const status = useSelector(state => state.sessionManager.status);
  const campaignEdit = useSelector(state => state.sessionManager.campaignEdit);
  const introCampaignEdit = useSelector(state => state.sessionManager.introCampaignEdit);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignData = useSelector(state => state.campaignData);
  const activeCardId = useSelector(state => state.campaignData.activeCardId);

  // FUNCTIONS
  const createCard = () => dispatch(actions.createCard(activeCampaignId));

  const copyCard = () => {
    if (activeCardId) {
      dispatch(actions.copyCard(activeCardId));
    }
  };

  const saveEditedData = () => {
    dispatch(actions.setStatus('saving'));
    dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData,
      () => dispatch(actions.setStatus('idle'))
    ));
  };

  let disableSave = ((status === 'idle') && userId && activeCampaignId) 
    ? false
    : true;

  const saveTooltip = userId
    ? (status === 'saving')
      ? "Saving..."
      : "Save"
    : "Please create an account to save!";

  return (
    <div className="tool-menu" ref={toolMenuRef}>
      <button className="create-card toolmenu-item btn-32" onClick={createCard}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">{activeCampaignId ? "Add card" : "Please select a project first."}</span>
      </button>
      <button className="copy-card toolmenu-item btn-32" onClick={copyCard}>
        <img src={CopyImg} alt="Copy" draggable="false" />
        <span className="tooltip">{activeCampaignId ? "Copy selected card" : "Please select a project first."}</span>
      </button>
      {(campaignEdit || introCampaignEdit)
        ? <div className="save-indicator toolmenu-item btn-32">
            <img src={AlertImg} alt="Unsaved changes" draggable="false" />
            <span className="tooltip">You have unsaved changes.</span>
          </div>
        : null
      }
      <button className="save toolmenu-item btn-32" 
        disabled={disableSave}
        onClick={saveEditedData}>
        {(status === 'saving')
          ? <div className="spinner" />
          : <img src={SaveImg} alt="Save" draggable="false" />}
        <span className="tooltip">{saveTooltip}</span>
      </button>
      <div className="back-strip" />
    </div>
  );
};

export default ToolMenu;