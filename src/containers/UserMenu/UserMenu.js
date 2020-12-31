import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './UserMenu.scss';
import * as actions from '../../store/actionIndex';

const UserMenu = React.memo(props => {
  const dispatch = useDispatch();

  // STATES
  const [showCampaignDropDown, setShowCampaignDropDown] = useState(false);
  const [showUserDropDown, setShowUserDropDown] = useState(false);

  // VARIABLES
  const user = useSelector(state => state.account.user);
  const campaign = useSelector(state => state.account.campaign);

  // IDS & REFS
  const campaignDropDownRef = useRef("campaignDropDown");
  const userDropDownRef = useRef("userDropDown");

  return (
    <div id="userMenu">
      <div className="dmkit-title">DM Kit</div>
      <div className="campaign button" onClick={() => setShowCampaignDropDown(!showCampaignDropDown)}>
        CAMPAIGNS
        <img />
      </div>
      <div className="user button" onClick={() => setShowUserDropDown(!showUserDropDown)}>
        SIGN IN / SIGN UP
        <img />
      </div>

      <div ref={campaignDropDownRef} 
        className="campaign drop-down" style={{display: showCampaignDropDown ? "block" : "none"}}>
      </div>
      <div ref={userDropDownRef} 
        className="user drop-down" style={{display: showUserDropDown ? "block" : "none"}}>
        <form id="sign-in-form">
          <label for="email"><b>Email</b></label>
          <input type="text" placeholder="Enter Email" name="email" required/>
          <label for="psw"><b>Password</b></label>
          <input type="password" placeholder="Enter Password" name="psw" required/>
          <button type="submit">Login</button>
        </form>
        <form>

        </form>
      </div>
    </div>
  );
});

export default UserMenu;