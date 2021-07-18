import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import { store } from '../../index';

import AddImg from '../../assets/icons/add-32.png';
import CopyImg from '../../assets/icons/copy-32.png';
import UndoImg from '../../assets/icons/undo-32.png';
import RedoImg from '../../assets/icons/redo-32.png';
import ResetImg from '../../assets/icons/reset-32.png';
import LockImg from '../../assets/icons/lock-32.png';
import UnlockImg from '../../assets/icons/unlock-32.png';
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
  const activeCardId = useSelector(state => state.sessionManager.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const activeViewLock = useSelector(state => activeViewId ? state.campaignData.present.views[activeViewId].lock : null);
  const campaignData = useSelector(state => state.campaignData.present);
  const pastCampaignData = useSelector(state => state.campaignData.past);
  const futureCampaignData = useSelector(state => state.campaignData.future);

  // FUNCTIONS
  const saveEditedData = () => {
    console.log("[Status] saving. Triggered by manual save.");
    dispatch(actions.setStatus('saving'));
    dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData,
      () => {
        console.log("[Status] idle. Triggered by manual save completion.");
        dispatch(actions.setStatus('idle'))
      }
    ));
  };

  let disableSave = ((status === 'idle') && userId && activeCampaignId) ? false : true;

  const saveTooltip = userId
    ? (status === 'saving')
      ? "Saving..."
      : "Save"
    : "Please create an account to save!";

  return (
    <div className="tool-menu" ref={toolMenuRef}>
      {/* create card */}
      <button className="create-card toolmenu-item btn-32" 
        disabled={!activeViewId}
        onClick={() => dispatch(actions.createCard())}>
        <img src={AddImg} alt="Add" draggable="false" />
        <span className="tooltip">{(userId && !activeCampaignId) ? "Please select a project first." : "Add card"}</span>
      </button>
      {/* copy card */}
      <button className="copy-card toolmenu-item btn-32" 
        disabled={!activeViewId || !activeCardId}
        onClick={() => dispatch(actions.copyCard(activeCardId))}>
        <img src={CopyImg} alt="Copy" draggable="false" />
        <span className="tooltip">{(userId && !activeCampaignId) ? "Please select a project first." : "Copy card"}</span>
      </button>
      {/* undo */}
      <button className="undo toolmenu-item btn-32"
        disabled={pastCampaignData.length === 0}
        onClick={() => store.dispatch(ActionCreators.undo())}>
        <img src={UndoImg} alt="Undo" draggable="false" />
        <span className="tooltip">{(userId && !activeCampaignId) ? "Please select a project first." : "Undo"}</span>
      </button>
      {/* redo */}
      <button className="redo toolmenu-item btn-32"
        disabled={futureCampaignData.length === 0}
        onClick={() => store.dispatch(ActionCreators.redo())}>
        <img src={RedoImg} alt="Redo" draggable="false" />
        <span className="tooltip">{(userId && !activeCampaignId) ? "Please select a project first." : "Redo"}</span>
      </button>
      {/* reset view */}
      <button className="reset-view toolmenu-item btn-32" 
        disabled={(activeViewLock === undefined) ? true : activeViewLock}
        onClick={() => dispatch(actions.resetActiveView())}>
        <img src={ResetImg} alt="Reset" draggable="false" />
        <span className="tooltip">Reset board position</span>
      </button>
      {/* lock/unlock view */}
      {activeViewLock === false
        ? <button className="lock-view toolmenu-item btn-32" onClick={() => dispatch(actions.lockActiveView())}>
            <img src={UnlockImg} alt="Lock" draggable="false" />
            <span className="tooltip">Lock board</span>
          </button>
        : <button className="lock-view toolmenu-item btn-32" onClick={() => dispatch(actions.unlockActiveView())}>
            <img src={LockImg} alt="Unlock" draggable="false" />
            <span className="tooltip">Unlock board</span>
          </button>}
      {/* unsaved work indicator */}
      {(campaignEdit || introCampaignEdit)
        ? <div className="save-indicator toolmenu-item btn-32">
            <img src={AlertImg} alt="Unsaved changes" draggable="false" />
            <span className="tooltip">You have unsaved changes.</span>
          </div>
        : null
      }
      {/* save */}
      <button className="save toolmenu-item btn-32" 
        disabled={disableSave}
        onClick={saveEditedData}>
        {(status === 'saving')
          ? <div className="spinner" />
          : <img src={SaveImg} alt="Save" draggable="false" />}
        <span className="tooltip">{saveTooltip}</span>
      </button>
    </div>
  );
};

export default ToolMenu;