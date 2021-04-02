import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './Campaign.scss';
import * as actions from '../../../../store/actionIndex';
import * as fireactions from '../../../../store/firestoreIndex';

import CopyImg from '../../../../assets/icons/copy-24.png';
import DeleteImg from '../../../../assets/icons/delete-24.png';

const Campaign = props => {
  const {campaignId, campaignTitle, setShowCampaignDropdown} = props;
  const dispatch = useDispatch();

  // STATES
  const [confirmDelete, setConfirmDelete] = useState(false);

  // STORE SELECTORS
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignData = useSelector(state => state.campaignData);

  // REFS
  const campaignDeleteBtnRef = useRef();

  // FUNCTIONS: campaign management
  const switchCampaign = () => {
    if (activeCampaignId) {
      dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData,
        dispatch(fireactions.switchCampaign(campaignId))
      ));
    } else {
      dispatch(fireactions.switchCampaign(campaignId));
    }
    setShowCampaignDropdown(false);
  };

  const copyCampaign = () => {
    if (campaignId === activeCampaignId) {
      dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData,
        dispatch(fireactions.copyCampaign(campaignId))
      ));
    } else {
      dispatch(fireactions.copyCampaign(campaignId));
    }
  };

  const destroyCampaign = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
    } else {
      dispatch(fireactions.destroyCampaign(campaignId, 
        (campaignId === activeCampaignId) 
          ? () => {
              dispatch(fireactions.switchCampaign(null));
              dispatch(actions.unloadCampaignData());
            }
          : null
      ));
    }
  };

  useOutsideClick([campaignDeleteBtnRef], confirmDelete, setConfirmDelete, false);

  return (
    <div className="campaign">
      <button className="campaign-title btn-any" title={campaignTitle}
        style={{backgroundColor: (campaignId === activeCampaignId) ? "orange" : null}} 
        onClick={switchCampaign}>
        {campaignTitle}
      </button>
      <button className="copy-campaign btn-24"
        onClick={copyCampaign}>
        <img src={CopyImg} alt="Copy" draggable="false" />
        <span className="tooltip">Copy campaign</span>
      </button>
      <button ref={campaignDeleteBtnRef} className="destroy-campaign btn-24" 
        style={{backgroundColor: confirmDelete ? "red" : null}} 
        onClick={destroyCampaign}>
        <img src={DeleteImg} alt="Delete" draggable="false" />
        <span className="tooltip">Delete campaign</span>
      </button>
    </div>
  );
};

export default Campaign;