import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
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
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignTitle = useSelector(state => state.campaignData.title);

  // REFS
  const campaignTitleRef = useRef();
  const campaignDropdownBtnRef = useRef();
  const campaignDropdownContentRef = useRef();
  const authDropdownBtnRef = useRef();
  const authDropdownContentRef = useRef();

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
  useOutsideClick([campaignTitleRef], editingTitle, endTitleEdit);

  const updTitleEdit = () => {
    if (editingTitle) dispatch(actions.updCampaignTitle(campaignTitleRef.current.value));
  };

  const keyPressTitleHandler = (event) => {
    if (editingTitle && event.key === 'Enter') endTitleEdit();
  };

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
        {activeCampaignId 
          ? <div className="dmkit-title">
              <input ref={campaignTitleRef} className="title-text"
                type="text" required draggable="false"
                value={campaignTitle ? campaignTitle : ""} readOnly={!editingTitle}
                onDoubleClick={userId ? beginTitleEdit : null}
                onChange={userId ? updTitleEdit : null}
                onKeyDown={userId ? (e => keyPressTitleHandler(e)) : null}
              />
              <button className="edit-title btn-32"
                onClick={()=>beginTitleEdit()}>
                <img src={EditImg} alt="Edit" draggable="false" />
                <span className="tooltip">Edit title</span>
              </button>
            </div>
          : <div className="dmkit-title"><div className="title-text">DM Kit</div></div>
        }
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