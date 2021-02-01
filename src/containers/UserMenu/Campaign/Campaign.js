import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './Campaign.scss';
import * as actions from '../../../store/actionIndex';

import EditImg from '../../../assets/icons/edit-24.png';
import DeleteImg from '../../../assets/icons/delete-24.png';

const Campaign = props => {
  const {campaignId, setShowCampaignDropDown} = props;
  const dispatch = useDispatch();

  // STATES
  const [editingTitle, setEditingTitle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // STORE SELECTORS
  const dataManager = useSelector(state => state.dataManager);
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const viewColl = useSelector(state => state.viewColl);
  const activeCampaignId = useSelector(state => state.dataManager.activeCampaignId);
  const campaignTitle = campaignColl[campaignId] ? campaignColl[campaignId].title : "";

  // IDS & REFS
  const campaignTitleId = campaignId+".title";
  const campaignTitleRef = useRef(campaignTitleId);
  const campaignEditBtnRef = useRef(campaignId+".editButton");
  const campaignDeleteBtnRef = useRef(campaignId+".deleteButton");

  // FUNCTIONS: campaign management
  const switchCampaign = (event) => {
    event.preventDefault();
    dispatch(actions.switchCampaign(campaignId, activeCampaignId, campaignColl, cardColl, viewColl, dataManager));
    setShowCampaignDropDown(false);
  };

  const removeCampaign = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
    } else {
      dispatch(actions.destroyCampaign(campaignId));
    }
  };

  // FUNCTIONS: campaign title edit
  const startTitleEdit = () => {
    if (!editingTitle) {
      const title = document.getElementById(campaignTitleId);
      title.focus();
      title.setSelectionRange(title.value.length, title.value.length);
      setEditingTitle(true);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {setEditingTitle(false)}
  };
  useOutsideClick([campaignTitleRef], editingTitle, endTitleEdit);
  
  const updTitleEdit = () => {
    if (editingTitle) {dispatch(actions.updCampaignTitle(campaignId, campaignTitleRef.current.value))}
  };

  const keyPressTitleHandler = (event) => {
    if (editingTitle && event.key === 'Enter') {endTitleEdit()}
  };

  // STYLES
  const campaignTitleStyle = {
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
  };
  const deleteButtonStyle = {
    backgroundColor: confirmDelete ? "red" : "lightgray",
  };

  return (
    <div className="campaign">
      <input id={campaignTitleId} ref={campaignTitleRef}
        className="campaign-title" style={campaignTitleStyle} type="text" required
        value={campaignTitle} readOnly={!editingTitle}
        onClick={switchCampaign}
        onChange={updTitleEdit}
        onKeyDown={e => keyPressTitleHandler(e)}
      />
      <div ref={campaignEditBtnRef} className="button"
        onClick={startTitleEdit}
      >
        <img src={EditImg} alt="Edit" draggable="false" />
        {/* <span className="tooltip">Edit title</span> */}
      </div>
      <div ref={campaignDeleteBtnRef} className="button" style={deleteButtonStyle}
        onClick={removeCampaign}
      >
        <img src={DeleteImg} alt="Delete" draggable="false" />
        {/* <span className="tooltip">Delete campaign</span> */}
      </div>
    </div>
  );
};

export default Campaign;