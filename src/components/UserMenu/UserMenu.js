import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';
import CampaignList from './CampaignList/CampaignList';
import AuthDropdown from './AuthDropdown/AuthDropdown';
import SignUp from './SignUp/SignUp';

import EditImg from '../../assets/icons/edit-32.png'

const UserMenu = props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const displayName = useSelector(state => state.userData.displayName);
  const email = useSelector(state => state.userData.email);
  const campaignTitle = useSelector(state => state.campaignData.title);

  // REFS
  const campaignTitleRef = useRef("campaignTitle");
  const campaignDropdownBtnRef = useRef("campaignDropdownBtn");
  const campaignDropdownContentRef = useRef("campaignDropdownContent");
  const userDropdownBtnRef = useRef("userDropdownBtn");
  const userDropdownContentRef = useRef("userDropdownContent");

  // FUNCTIONS: CAMPAIGN TITLE
  const beginTitleEdit = () => {
    if (!editingTitle) {
      campaignTitleRef.current.focus();
      campaignTitleRef.current.setSelectionRange(campaignTitleRef.current.value.length, campaignTitleRef.current.value.length);
      setEditingTitle(true);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) setEditingTitle(false);
  };

  const updTitleEdit = () => {
    if (editingTitle) dispatch(actions.updCampaignTitle(campaignTitleRef.current.value));
  };

  const keyPressTitleHandler = (event) => {
    if (editingTitle && event.key === 'Enter') endTitleEdit();
  };  

  // FUNCTIONS: OUTSIDECLICKS
  useOutsideClick([campaignTitleRef], editingTitle, endTitleEdit);
  useOutsideClick([campaignDropdownBtnRef, campaignDropdownContentRef], showCampaignDropdown, 
    () => setShowCampaignDropdown(false)
  );
  useOutsideClick([userDropdownBtnRef, userDropdownContentRef], showUserDropdown, 
    () => setShowUserDropdown(false)
  );

  return (
    <>
      <div className="user-menu">
        {/* title */}
        <div className="dmkit-title">
          <input ref={campaignTitleRef} className="title-text"
            type="text" required draggable="false"
            value={(userId && campaignTitle) ? campaignTitle : "DM Kit"} readOnly={!editingTitle}
            onDoubleClick={userId ? beginTitleEdit : null}
            onChange={userId ? updTitleEdit : null}
            onKeyDown={userId ? (e => keyPressTitleHandler(e)) : null}
          />
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
            <AuthDropdown setShowSignUp={setShowSignUp} setShowUserDropdown={setShowUserDropdown} />
          </div>
        </div>
      </div>
      {/* sign up pop up */}
      <SignUp showSignUp={showSignUp} onBackdropClick={()=>setShowSignUp(false)} />
    </>
  );
};

export default UserMenu;