import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import CampaignList from './CampaignList/CampaignList';
import SignIn from './SignIn/SignIn';
import SignUp from './SignUp/SignUp';

import AlertImg from '../../assets/icons/alert-32.png';

const UserMenu = props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  // STORE SELECTORS
  const {userId, displayName, email} = useSelector(state => state.userData);
  const campaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignEdit = useSelector(state => state.sessionManager.campaignEdit);
  const campaignData = useSelector(state => state.campaignData);
  const campaignTitle = useSelector(state => state.campaignData.title);

  // IDS & REFS
  const campaignTitleRef = useRef("campaignTitle");
  const campaignDropdownBtnRef = useRef("campaignDropdownBtn");
  const campaignDropdownContentRef = useRef("campaignDropdownContent");
  const userDropdownBtnRef = useRef("userDropdownBtn");
  const userDropdownContentRef = useRef("userDropdownContent");

  // Autosave every 5 minutes
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (userId && campaignId && campaignEdit) {
        dispatch(fireactions.saveCampaignData(campaignId, campaignData));
      }
    }, 50000);
    return () =>  clearInterval(autoSave);
  }, [userId, campaignId, campaignEdit, campaignData, dispatch]);

  // Load data for active campaign
  useEffect(() => {
    if (campaignId) {
      dispatch(fireactions.fetchCampaignData(campaignId));
    }
  }, [dispatch, campaignId]);

  // Set campaignEdit to true when campaignData changes.
  useEffect(() => {
    if (campaignData) {
      dispatch(actions.setCampaignEdit(true));
    }
  }, [dispatch, campaignData]);

  // FUNCTIONS: CAMPAIGN TITLE
  const beginTitleEdit = () => {
    if (!editingTitle) {
      campaignTitleRef.current.focus();
      campaignTitleRef.current.setSelectionRange(campaignTitleRef.current.value.length, campaignTitleRef.current.value.length);
      setEditingTitle(true);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {setEditingTitle(false)}
  };

  const updTitleEdit = () => {
    if (editingTitle) {dispatch(actions.updCampaignTitle(campaignId, campaignTitleRef.current.value))}
  };

  const keyPressTitleHandler = (event) => {
    if (editingTitle && event.key === 'Enter') {endTitleEdit()}
  };  

  // FUNCTIONS: OUTSIDECLICKS
  useOutsideClick([campaignTitleRef], editingTitle, endTitleEdit);
  useOutsideClick([campaignDropdownBtnRef, campaignDropdownContentRef], showCampaignDropdown, () => setShowCampaignDropdown(false));
  useOutsideClick([userDropdownBtnRef, userDropdownContentRef], showUserDropdown, () => setShowUserDropdown(false));
  
  // STYLES: CAMPAIGN TITLE
  const campaignTitleStyle = {};

  return (
    <>
      <div id="user-menu">
        {/* title */}
        <div id="dmkit-title">
          <input ref={campaignTitleRef}
            className="title-text" style={campaignTitleStyle}
            type="text" required draggable="false"
            value={userId ? campaignTitle : "DM Kit"} readOnly={!editingTitle}
            onDoubleClick={userId ? beginTitleEdit : null}
            onChange={userId ? updTitleEdit : null}
            onKeyDown={userId ? (e => keyPressTitleHandler(e)) : null}
          />
          <div className="save-warning" style={{visibility: campaignEdit ? 'visible' : 'hidden'}}>
            <img src={AlertImg} alt="Save Warning" draggable="false" />
            <span className="tooltip">You have unsaved work.</span>
          </div>
        </div>
        {/* campaign select */}
        <div className="campaign dropdown" style={{display: userId ? "block" : "none"}}>
          <div ref={campaignDropdownBtnRef} className="dropdown-btn" onClick={()=>setShowCampaignDropdown(!showCampaignDropdown)}>
            Campaigns
          </div>
          <div ref={campaignDropdownContentRef} className="dropdown-content" style={{display: showCampaignDropdown ? "block" : "none"}}>
            <CampaignList setShowCampaignDropdown={setShowCampaignDropdown} />
          </div>
        </div>
        {/* user profile */}
        <div className="user dropdown">
          <div ref={userDropdownBtnRef} className="dropdown-btn" onClick={()=>setShowUserDropdown(!showUserDropdown)}>
            {displayName ? displayName : email ? email : "Sign In / Sign Up"}
          </div>
          <div ref={userDropdownContentRef} className="dropdown-content" style={{display: showUserDropdown ? "block" : "none"}}>
            <SignIn setShowSignUp={setShowSignUp} setShowUserDropdown={setShowUserDropdown} />
          </div>
        </div>
      </div>
      {/* sign up pop up */}
      <SignUp showSignUp={showSignUp} onBackdropClick={()=>setShowSignUp(false)} />
    </>
  );
};

export default UserMenu;