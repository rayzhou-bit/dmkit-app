import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';

const UserMenu = React.memo(props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropDown, setShowCampaignDropDown] = useState(false);
  const [showUserDropDown, setShowUserDropDown] = useState(false);
  const [authForm, setAuthForm] = useState('signin');  // signedin, signin or signup
  const [email, setEmail] = useState("");
  const [psw, setPsw] = useState("");

  // VARIABLES
  const userId = useSelector(state => state.user.user);
  const campaignId = useSelector(state => state.campaignManage.activeCampaign);
  const campaignColl = useSelector(state => state.campaignColl);

  // IDS & REFS
  const campaignDropDownRef = useRef("campaignDropDown");
  const userDropDownRef = useRef("userDropDown");

  // FUNCTIONS
  const emailSignIn = (event) => {
    event.preventDefault();
    dispatch(actions.emailSignIn(email, psw))
  };
  const emailSignUp = () => dispatch(actions.emailSignUp());
  
  let campaignPanel = <div/>;
  // add campaign button

  let userPanel = <div/>;
  switch (authForm) {
    case 'signedin': 
      userPanel = (
        <a>Sign Out</a>
      );
      break;
    case 'signin':
      userPanel = (
        <div className="sign-in panel">
          <h1>Login</h1>
          <form id="sign-in-form" onSubmit={e=>emailSignIn(e)}>
            <label htmlFor="email"><b>Email</b></label>
            <input type="email" placeholder="Enter Email" name="email" required 
              value={email} onChange={e=>setEmail(e.target.value)} />
            <label htmlFor="psw"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="psw" required 
              value={psw} onChange={e=>setPsw(e.target.value)} />
            <button type="submit">Log In</button>
          </form>
          <a onClick={()=>setAuthForm('signup')}>Don't have an account? Sign up now</a>
        </div>
      );
      break;
    case 'signup':
      userPanel = (
        <div className="sign-up panel">
          <h1>Sign Up</h1>
          <form id="sign-up-form">
            <label htmlFor="email"><b>Email</b></label>
            <input type="email" placeholder="Enter Email" name="email" required
              value={email} onChange={e=>setEmail(e.target.value)} />
            <label htmlFor="psw"><b>Password</b></label>
            <input type="password" placeholder="Enter Password" name="psw" required 
              value={psw} onChange={e=>setPsw(e.target.value)} />
            <button type="submit">Sign Up</button>
          </form>
          <a onClick={()=>setAuthForm('signin')}>Already have an account? Log in here</a>
        </div>
      );
      break;
    default:
      console.log("Invalid auth value");
      break;
  };

  return (
    <div id="userMenu">
      <div className="dmkit-title">DM Kit</div>
      <div className="campaign button" style={{display: userId ? "block" : "none"}}
        onClick={() => setShowCampaignDropDown(!showCampaignDropDown)}
      >
        CAMPAIGNS
        {/* IMPLEMENT: SHOW THIS ONLY IF LOGGED IN */}
        <img />
      </div>
      <div className="user button" 
        onClick={() => setShowUserDropDown(!showUserDropDown)}
      >
        LOGIN / SIGN UP
        <img />
      </div>

      <div ref={campaignDropDownRef} 
        className="campaign drop-down" style={{display: showCampaignDropDown ? "block" : "none"}}>
        {campaignPanel}
      </div>
      <div ref={userDropDownRef} 
        className="user drop-down" style={{display: showUserDropDown ? "block" : "none"}}>
        {userPanel}
      </div>
    </div>
  );
});

export default UserMenu;