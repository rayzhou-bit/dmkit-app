import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';
import Campaign from './Campaign/Campaign';
import Signup from './Signup/Signup';

import AlertImg from '../../assets/icons/alert-32.png';

const UserMenu = props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropDown, setShowCampaignDropDown] = useState(false);
  const [showUserDropDown, setShowUserDropDown] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  // STORE SELECTORS
  const userId = actions.getUserId();
  const userEmail = actions.getUserEmail();
  const dataManager = useSelector(state => state.dataManager);
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const viewColl = useSelector(state => state.viewColl);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const campaignTitle = campaignColl[campaignId] ? campaignColl[campaignId].title : "";
  const campaignEdit = dataManager.campaignEdit ? dataManager.campaignEdit : null;
  const emailSignInError = useSelector(state => state.dataManager.errorEmailSignIn);

  // IDS & REFS
  const campaignTitleId = "campaignTitle";
  const campaignTitleRef = useRef(campaignTitleId);
  const campaignDropDownBtnRef = useRef("campaignDropDownBtn");
  const campaignDropDownContentRef = useRef("campaignDropDownContent");
  const userDropDownBtnRef = useRef("userDropDownBtn");
  const userDropDownContentRef = useRef("userDropDownContent");

  // Autosave
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (userId && campaignId && campaignEdit) {
        dispatch(actions.autoSaveCampaignData(campaignId, campaignColl, cardColl, viewColl, dataManager));
      }
    }, 5000);
    return () => clearInterval(autoSave);
  }, [dispatch, userId, campaignId, campaignEdit, campaignColl, cardColl, viewColl, dataManager]);

  // On sign in
  useEffect(() => {
    if (userId) {
      setEmail("");
      setPsw("");
      setShowUserDropDown(false);
    }
  }, [userId]);

  // Load data for activeCampaign
  useEffect(() => {
    if (campaignEdit && campaignColl["introCampaign"]) {
      const save = window.confirm("Would you like to save this to your account as a new campaign?");
      if (save) {
        dispatch(actions.sendIntroCampaignData(campaignColl, cardColl, viewColl));
      } else {
        dispatch(actions.removeCampaign("introCampaign"));
        if (campaignId) { dispatch(actions.receiveCampaignData(campaignId)); }
      }
    } else {
      dispatch(actions.receiveCampaignData(campaignId));
    }
  }, [dispatch, campaignId]);

  // FUNCTIONS: SIGN IN
  const emailSignIn = (event) => { event.preventDefault(); actions.emailSignIn(email, psw, dispatch); };
  const emailSignOut = (event) => { 
    event.preventDefault(); 
    dispatch(actions.sendCampaignData(campaignId, campaignColl, cardColl, viewColl, dataManager));
    actions.emailSignOut(); 
    setShowUserDropDown(false);
  };

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
    if (editingTitle && event.key === 'Enter') {endTitleEdit()}
  };  

  // FUNCTIONS: CAMPAIGN MENU
  const newCampaign = () => dispatch(actions.createCampaign(campaignId, campaignColl, cardColl, viewColl, dataManager));

  // FUNCTIONS: OUTSIDECLICKS
  useOutsideClick([campaignTitleRef], editingTitle, endTitleEdit);
  useOutsideClick([campaignDropDownBtnRef, campaignDropDownContentRef], showCampaignDropDown, setShowCampaignDropDown, false);
  useOutsideClick([userDropDownBtnRef, userDropDownContentRef], showUserDropDown, setShowUserDropDown, false);
  
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
          <Campaign key={campaignId}
            campaignId={campaignId} campaignTitle={campaignTitle} activeCampaignId={campaignId} setShowCampaignDropDown={setShowCampaignDropDown}
          />,
        ];
      };
    }
    campaignList = [
      ...campaignList,
      <div key="newCampaign" className="new-campaign" onClick={newCampaign}>New Project</div>
    ];
  }
  
  let userDropDownContent = null;
  if (userId) {
    userDropDownContent = (
      <div id="sign-out" onClick={e => emailSignOut(e)}>Sign Out</div>
    );
  } else {
    userDropDownContent = (
      <form id="email-sign-in-form" onSubmit={e => emailSignIn(e)}>
        <h1>Login</h1>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input type="email" placeholder="Enter Email" name="email" required 
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-row">
          <label htmlFor="psw">Password</label>
          <input type="password" placeholder="Enter Password" name="psw" required 
            value={psw} onChange={e => setPsw(e.target.value)} />
        </div>
        <button type="submit">Log In</button>
        <div className="sign-in-error" style={{display: emailSignInError!=="" ? "block" : "none"}}>{emailSignInError}</div>
        <div className="sign-up-button" onClick={()=>{setShowSignup(true);setShowUserDropDown(false);}}>Don't have an account? <br/> Sign up now</div>
      </form>
    );
  }

  return (
    <>
      <div id="user-menu">

        {/* title */}
        <div id="dmkit-title">
          <input id={campaignTitleId} ref={campaignTitleRef}
            className="title-text" style={campaignTitleStyle}
            type="text" required draggable="false"
            value={userId ? campaignTitle : "DM Kit"} readOnly={!editingTitle}
            onDoubleClick={userId ? startTitleEdit : null}
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
          <div ref={campaignDropDownBtnRef} className="dropdown-btn" onClick={Object.keys(campaignColl).length>0 ? ()=>setShowCampaignDropDown(!showCampaignDropDown) : ()=>newCampaign()}>
            {Object.keys(campaignColl).length>0 ? "Projects" : "New Project"}
          </div>
          <div ref={campaignDropDownContentRef} className="dropdown-content" style={{display: showCampaignDropDown ? "block" : "none"}}>
            {campaignList}
          </div>
        </div>

        {/* user profile */}
        <div className="user dropdown">
          <div ref={userDropDownBtnRef} className="dropdown-btn" onClick={()=>setShowUserDropDown(!showUserDropDown)}>
            {userEmail ? userEmail.split('@')[0] : "Sign In / Sign Up"}
          </div>
          <div ref={userDropDownContentRef} className="dropdown-content" style={{display: showUserDropDown ? "block" : "none"}}>
            {userDropDownContent}
          </div>
        </div>
      </div>

      {/* sign up pop up */}
      <Signup show={showSignup} onBackdropClick={()=>setShowSignup(false)} />
    </>
  );
};

export default UserMenu;