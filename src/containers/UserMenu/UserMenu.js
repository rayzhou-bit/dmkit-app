import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';

const UserMenu = props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropDown, setShowCampaignDropDown] = useState(false);
  const [showUserDropDown, setShowUserDropDown] = useState(false);
  const [authForm, setAuthForm] = useState('signin');  // signin or signup
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  // VARIABLES
  const userId = actions.getUserId();
  const userEmail = actions.getUserEmail();
  const dataManager = useSelector(state => state.dataManager);
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const campaignTitle = campaignColl[campaignId] ? campaignColl[campaignId].title : "";

  // IDS & REFS
  const campaignButtonRef = useRef("campaignButton");
  const userButtonRef = useRef("userButton");
  const campaignDropDownRef = useRef("campaignDropDown");
  const userDropDownRef = useRef("userDropDown");
  const campaignTitleId = "campaignTitle"
  const campaignTitleRef = useRef(campaignTitleId);

  // FUNCTIONS: CAMPAIGN TITLE
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

  const updTitleEdit = () => {
    if (editingTitle) {dispatch(actions.updCampaignTitle(campaignId, campaignTitleRef.current.value))}
  };

  const keyPressTitleHandler = (event) => {
    if (editingTitle) {
      if (event.key === 'Enter') {
        endTitleEdit();
      }
    }
  };  

  // FUNCTIONS: SIGN IN
  const emailSignUp = (event) => {event.preventDefault(); actions.emailSignUp(email, psw); setShowUserDropDown(false)};
  const emailSignIn = (event) => {event.preventDefault(); actions.emailSignIn(email, psw); setShowUserDropDown(false)};
  const emailSignOut = (event) => {
    event.preventDefault(); 
    actions.emailSignOut(); 
    setShowUserDropDown(false);
    // IMPLEMENT: ask if save campaign
  };

  // FUNCTIONS: CAMPAIGN MENU
  const switchCampaign = (nextCampaignId) => dispatch(actions.switchCampaign(nextCampaignId, campaignId, campaignColl, cardColl, viewColl, dataManager));
  const newCampaign = () => dispatch(actions.createCampaign(campaignId, campaignColl, cardColl, viewColl, dataManager));

  // FUNCTIONS: OUTSIDECLICKS
  useOutsideClick([campaignTitleRef], editingTitle, endTitleEdit);
  useOutsideClick([campaignDropDownRef, campaignButtonRef], showCampaignDropDown, setShowCampaignDropDown, false);
  useOutsideClick([userDropDownRef, userButtonRef], showUserDropDown, setShowUserDropDown, false);
  
  // STYLES: CAMPAIGN TITLE
  const campaignTitleStyle = {
  };

  // DISPLAY ELEMENTS
  let campaignList = [];
  if (userId) {
    if (campaignColl) {
      for (let campaignId in campaignColl) {
        campaignList = [
          ...campaignList,
          <div key={campaignId} onClick={() => switchCampaign(campaignId)}>
            {campaignColl[campaignId].title ? campaignColl[campaignId].title : ""}
          </div>
        ];
      };
    }
    campaignList = [
      ...campaignList,
      <div key={"newCampaign"} onClick={newCampaign}>
        New Campaign
      </div>
    ];
  }
  
  let userPanel = null;
  if (userId) {
    userPanel = (
      <div onClick={e => emailSignOut(e)}>Sign Out</div>
    );
  } else {
    if (authForm === 'signup') {
      userPanel = (
        <div className="sign-up panel">
          <h1>Sign Up</h1>
          <form id="sign-up-form" onSubmit={e => emailSignUp(e)}>
            <label htmlFor="email"><b>Email</b></label>
            <input type="email" placeholder="Enter Email" name="email" required
              value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="psw"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="psw" required 
              value={psw} onChange={e => setPsw(e.target.value)} />
            <button type="submit">Sign Up</button>
          </form>
          <div onClick={() => setAuthForm('signin')}>Already have an account? Log in here</div>
        </div>
      );
    } else {
      userPanel = (
        <div className="sign-in panel">
          <h1>Login</h1>
          <form id="sign-in-form" onSubmit={e => emailSignIn(e)}>
            <label htmlFor="email"><b>Email</b></label>
            <input type="email" placeholder="Enter Email" name="email" required 
              value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="psw"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="psw" required 
              value={psw} onChange={e => setPsw(e.target.value)} />
            <button type="submit">Log In</button>
          </form>
          <div onClick={() => setAuthForm('signup')}>Don't have an account? Sign up now</div>
        </div>
      );
    }
  }

  return (
    <div id="userMenu">
      <div className="dmkit-title">
        <input id={campaignTitleId} ref={campaignTitleRef}
          className="title-text" style={campaignTitleStyle}
          type="text" required draggable="false"
          value={userId ? campaignTitle : "DM Kit"} readOnly={!editingTitle}
          onDoubleClick={userId ? startTitleEdit : null}
          onChange={userId ? updTitleEdit : null}
          onKeyUp={userId ? (e => keyPressTitleHandler(e)) : null}
        />
      </div>
      <div ref={campaignButtonRef}
        className="campaign button" style={{display: userId ? "block" : "none"}}
        onClick={Object.keys(campaignColl).length>0 ? ()=>setShowCampaignDropDown(!showCampaignDropDown) : ()=>newCampaign()}
      >
        {Object.keys(campaignColl).length>0 ? "Campaigns" : "New Campaign"}
      </div>
      <div ref={userButtonRef}
        className="user button" 
        onClick={() => setShowUserDropDown(!showUserDropDown)}
      >
        {userEmail ? userEmail.split('@')[0] : "SIGN IN"}
      </div>
      <div ref={campaignDropDownRef} 
        className="campaign drop-down" style={{display: showCampaignDropDown ? "block" : "none"}}
      >
        {campaignList}
      </div>
      <div ref={userDropDownRef} 
        className="user drop-down" style={{display: showUserDropDown ? "block" : "none"}}>
        {userPanel}
      </div>
    </div>
  );
};

export default UserMenu;