import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import TitleInput from '../UI/Inputs/TitleInput';
import CampaignList from './CampaignList/CampaignList';
import AuthDropdown from './AuthDropdown/AuthDropdown';
import SignUp from './SignUp/SignUp';

const UserMenu = props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const displayName = useSelector(state => state.userData.displayName);
  const email = useSelector(state => state.userData.email);
  const campaignTitle = useSelector(state => state.campaignData.title);

  // REFS
  const campaignDropdownBtnRef = useRef();
  const campaignDropdownContentRef = useRef();
  const authDropdownBtnRef = useRef();
  const authDropdownContentRef = useRef();

  // FUNCTIONS: CAMPAIGN TITLE
  const campaignDropdownHandler = () => {
    dispatch(fireactions.fetchCampaignList());
    setShowCampaignDropdown(!showCampaignDropdown);
  };

  useOutsideClick([campaignDropdownBtnRef, campaignDropdownContentRef], showCampaignDropdown, 
    () => setShowCampaignDropdown(false)
  );

  useOutsideClick([authDropdownBtnRef, authDropdownContentRef], showUserDropdown, 
    () => setShowUserDropdown(false)
  );

  return (
    <>
      <div className="user-menu">
        {/* title */}
        <div className="dmkit-title">
          <TitleInput className="campaign-title-text" btnClassName="edit-title btn-32" 
            btnSize={32}
            value={campaignTitle} saveValue={v => dispatch(actions.updCampaignTitle(v))} />
        </div>
        {/* campaign select */}
        <div className="campaign-dropdown" 
          style={{display: userId ? "block" : "none"}}>
          <div ref={campaignDropdownBtnRef} className="dropdown-btn btn-any" 
            onClick={campaignDropdownHandler}>
            Projects
          </div>
          <div ref={campaignDropdownContentRef} className="dropdown-content" 
            style={{display: showCampaignDropdown ? "block" : "none"}}>
            <CampaignList setShowCampaignDropdown={setShowCampaignDropdown} />
          </div>
        </div>
        {/* user profile */}
        <div className="auth-dropdown">
          <div ref={authDropdownBtnRef} className="dropdown-btn btn-any" 
            onClick={()=>setShowUserDropdown(!showUserDropdown)}>
            {displayName ? displayName : email ? email : "Sign In / Sign Up"}
          </div>
          <div ref={authDropdownContentRef} className="dropdown-content" 
            style={{display: showUserDropdown ? "block" : "none"}}>
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