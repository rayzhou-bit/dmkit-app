import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../../shared/utilityFunctions';

import './Campaign.scss';
import * as fireactions from '../../../../store/firestoreIndex';

import DeleteImg from '../../../../assets/icons/delete-24.png';

const Campaign = props => {
  const {campaignId, campaignTitle, setShowCampaignDropdown} = props;
  const dispatch = useDispatch();

  // STATES
  const [confirmDelete, setConfirmDelete] = useState(false);

  // STORE SELECTORS
  const activeCampaignId = useSelector(state => state.sesionManager.activeCampaignId);
  const campaignData = useSelector(state => state.campaignData);

  // IDS & REFS
  const campaignDeleteBtnRef = useRef(campaignId+".deleteButton");

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

  const destroyCampaign = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
    } else {
      dispatch(fireactions.destroyCampaign(campaignId));
    }
  };

  useOutsideClick([campaignDeleteBtnRef], confirmDelete, setConfirmDelete, false);

  // STYLES
  const campaignTitleStyle = {
    backgroundColor: campaignId === activeCampaignId ? "orange" : null,
  };
  const deleteButtonStyle = {
    backgroundColor: confirmDelete ? "red" : "lightgray",
  };

  return (
    <div className="campaign">
      <div className="campaign-title" style={campaignTitleStyle} onClick={switchCampaign}>
        {campaignTitle}
      </div>
      <button ref={campaignDeleteBtnRef} className="button" style={deleteButtonStyle} onClick={destroyCampaign}>
        <img src={DeleteImg} alt="Delete" draggable="false" />
        {/* <span className="tooltip">Delete campaign</span> */}
      </button>
    </div>
  );
};

export default Campaign;