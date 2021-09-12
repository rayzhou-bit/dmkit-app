import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ToolMenu.scss';
import * as actions from '../../store/actionIndex';
// import Button from './Button/Button';

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

      {/* reset view */}
      {/* <button className="reset-view toolmenu-item btn-32" 
        disabled={(activeViewLock === undefined) ? true : activeViewLock}
        onClick={() => dispatch(actions.resetActiveView())}>
        <img src={ResetImg} alt="Reset" draggable="false" />
        <span className="tooltip">Reset board position</span>
      </button> */}
      {/* lock/unlock view */}
      {/* {activeViewLock === false
        ? <button className="lock-view toolmenu-item btn-32" onClick={() => dispatch(actions.lockActiveView())}>
            <img src={UnlockImg} alt="Lock" draggable="false" />
            <span className="tooltip">Lock board</span>
          </button>
        : <button className="lock-view toolmenu-item btn-32" onClick={() => dispatch(actions.unlockActiveView())}>
            <img src={LockImg} alt="Unlock" draggable="false" />
            <span className="tooltip">Unlock board</span>
          </button>} */}
      {/* unsaved work indicator */}
      {/* {(campaignEdit || introCampaignEdit)
        ? <div className="save-indicator toolmenu-item btn-32">
            <img src={AlertImg} alt="Unsaved changes" draggable="false" />
            <span className="tooltip">You have unsaved changes.</span>
          </div>
        : null
      } */}
    </div>
  );
};

export default ToolMenu;