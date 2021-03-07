import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';
import Campaign from './Campaign/Campaign';
import SignUp from './SignUp/SignUp';

import AlertImg from '../../assets/icons/alert-32.png';

const UserMenu = props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  // STORE SELECTORS
  const dataManager = useSelector(state => state.dataManager);
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const viewColl = useSelector(state => state.viewColl);
  const userId = useSelector(state => state.user.userId);
  const displayName = useSelector(state => state.user.displayName);
  const userEmail = useSelector(state => state.user.email);
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const campaignTitle = campaignColl[campaignId] ? campaignColl[campaignId].title : "";
  const campaignEdit = dataManager.campaignEdit ? dataManager.campaignEdit : null;
  const emailSignInError = useSelector(state => state.dataManager.errorEmailSignIn);
  const googleSignInError = useSelector(state => state.dataManager.errorGoogleSignIn);
  // TODO: implement facebook sign in
  // const facebookSignInError = useSelector(state => state.dataManager.errorFacebookSignIn);

  // IDS & REFS
  const campaignTitleId = "campaignTitle";
  const campaignTitleRef = useRef(campaignTitleId);
  const campaignDropdownBtnRef = useRef("campaignDropdownBtn");
  const campaignDropdownContentRef = useRef("campaignDropdownContent");
  const userDropdownBtnRef = useRef("userDropdownBtn");
  const userDropdownContentRef = useRef("userDropdownContent");

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
      setShowUserDropdown(false);
    }
  }, [userId]);

  // Load data for active campaign
  useEffect(() => {
    //TODO unload campaign before set new campaign IMPLEMENT promise
    if (userId) {
      if (campaignColl["introCampaign"]) {
        let save = null;
        if (campaignEdit) {
          save = window.confirm("You have unsaved changes. Would you like to save this to your account as a new project?");
        }
        if (save) {
          dispatch(actions.saveIntroCampaignData(campaignColl, cardColl, viewColl));
        } else {
          dispatch(actions.unloadIntroCampaign(campaignId));
          dispatch(actions.loadCampaignData(campaignId));
        }
      } else {
        dispatch(actions.unloadCampaignData());
        dispatch(actions.loadCampaignData(campaignId));
      }
    } else {
      if (campaignId === "introCampaign") {
        dispatch(actions.unloadCampaignData());
        dispatch(actions.loadIntroCampaign());
      }
    }
  }, [dispatch, campaignId]);

  // FUNCTIONS: USER AUTH
  const emailSignIn = (event) => { event.preventDefault(); actions.emailSignIn(email, psw, dispatch); };
  const googleSignIn = (event) => { event.preventDefault(); actions.googleSignIn(dispatch); };
  // const facebookSignIn = (event) => { event.preventDefault(); actions.facebookSignIn(dispatch); };
  const emailSignOut = (event) => { 
    event.preventDefault(); 
    dispatch(actions.saveCampaignData(campaignId, campaignColl, cardColl, viewColl, dataManager));
    actions.emailSignOut(); 
    setShowUserDropdown(false);
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
  useOutsideClick([campaignDropdownBtnRef, campaignDropdownContentRef], showCampaignDropdown, setShowCampaignDropdown, false);
  useOutsideClick([userDropdownBtnRef, userDropdownContentRef], showUserDropdown, setShowUserDropdown, false);
  
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
            campaignId={campaignId} campaignTitle={campaignTitle} activeCampaignId={campaignId} setShowCampaignDropdown={setShowCampaignDropdown}
          />,
        ];
      };
    }
    campaignList = [
      ...campaignList,
      <div key="newCampaign" className="new-campaign" onClick={newCampaign}>New Project</div>
    ];
  }
  
  let userDropdownContent = null;
  if (userId) {
    userDropdownContent = (
      <div id="sign-out" onClick={e => emailSignOut(e)}>Sign Out</div>
    );
  } else {
    userDropdownContent = (
      <div id="sign-in-dropdown">
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
          <div className="sign-up-button" onClick={()=>{setShowSignUp(true);setShowUserDropdown(false);}}>Don't have an account? <br/> Sign up now</div>
        </form>
        <div className="divider" />
        <div id="other-provider-sign-in">
          <button onClick={e => googleSignIn(e)}>Sign In with Google</button>
          <div className="sign-in-error" style={{display: googleSignInError!=="" ? "block" : "none"}}>{googleSignInError}</div>
          {/* <button onClick={e => facebookSignIn(e)}>Sign In with Facebook</button>
          <div className="sign-in-error" style={{display: facebookSignInError!=="" ? "block" : "none"}}>{facebookSignInError}</div> */}
        </div>
      </div>
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
          <div ref={campaignDropdownBtnRef} className="dropdown-btn" onClick={Object.keys(campaignColl).length>0 ? ()=>setShowCampaignDropdown(!showCampaignDropdown) : ()=>newCampaign()}>
            {Object.keys(campaignColl).length>0 ? "Campaigns" : "New Campaign"}
          </div>
          <div ref={campaignDropdownContentRef} className="dropdown-content" style={{display: showCampaignDropdown ? "block" : "none"}}>
            {campaignList}
          </div>
        </div>

        {/* user profile */}
        <div className="user dropdown">
          <div ref={userDropdownBtnRef} className="dropdown-btn" onClick={()=>setShowUserDropdown(!showUserDropdown)}>
            {displayName ? displayName : userEmail ? userEmail : "Sign In / Sign Up"}
          </div>
          <div ref={userDropdownContentRef} className="dropdown-content" style={{display: showUserDropdown ? "block" : "none"}}>
            {userDropdownContent}
          </div>
        </div>
      </div>

      {/* sign up pop up */}
      <SignUp showSignUp={showSignUp} onBackdropClick={()=>setShowSignUp(false)} />
    </>
  );
};

export default UserMenu;