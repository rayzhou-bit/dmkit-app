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

  // VARIABLES
  const campaignColl = useSelector(state => state.campaignColl);
  const cardColl = useSelector(state => state.cardColl);
  const viewColl = useSelector(state => state.viewColl);
  const cardManager = useSelector(state => state.cardManager);
  const viewManager = useSelector(state => state.viewManager);
  const userId = actions.getUserId();
  const userEmail = actions.getUserEmail();
  const campaignId = useSelector(state => state.dataManager.activeCampaignId);
  const campaignTitle = (campaignColl[campaignId] && campaignColl[campaignId].title) ? campaignColl[campaignId].title : null;

  // IDS & REFS
  const campaignButtonRef = useRef("campaignButton");
  const userButtonRef = useRef("userButton");
  const campaignDropDownRef = useRef("campaignDropDown");
  const userDropDownRef = useRef("userDropDown");

  // FUNCTIONS
  // useEffect(() => {
  //   dispatch(actions.initAuthCheck());
  // }, [dispatch]);

  const emailSignUp = (event) => {event.preventDefault(); actions.emailSignUp(email, psw); setShowUserDropDown(false)};
  const emailSignIn = (event) => {event.preventDefault(); actions.emailSignIn(email, psw); setShowUserDropDown(false)};
  const emailSignOut = (event) => {
    event.preventDefault(); 
    actions.emailSignOut(); 
    setShowUserDropDown(false);
    // IMPLEMENT: ask if save campaign
  };

  const switchCampaign = (nextCampaignId) => dispatch(actions.switchCampaign(nextCampaignId, campaignId, campaignColl, cardColl, viewColl, cardManager, viewManager));
  const newCampaign = () => dispatch(actions.createCampaign(campaignId, campaignColl, cardColl, viewColl, cardManager, viewManager));

  useOutsideClick([campaignDropDownRef, campaignButtonRef], showCampaignDropDown, setShowCampaignDropDown, false);
  useOutsideClick([userDropDownRef, userButtonRef], showUserDropDown, setShowUserDropDown, false);
  
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
      <div className="dmkit-title">{campaignTitle ? campaignTitle : "DM Kit"}</div>
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