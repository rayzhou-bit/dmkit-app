import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutsideClick } from '../../../shared/utilityFunctions';

import './AuthDropdown.scss';
import * as actions from '../../../store/actionIndex';
import * as fireactions from '../../../store/firestoreIndex';

const AuthDropdown = props => {
  const {setShowSignUp, setShowUserDropdown} = props;
  const dispatch = useDispatch();

  // STATES
  const [emailInput, setEmailInput] = useState("");
  const [pswInput, setPswInput] = useState("");
  const [showPasswordResetMsg, setShowPasswordResetMsg] = useState(false);
  const [showDisplayInput, setShowDisplayInput] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");

  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const email = useSelector(state => state.userData.email);
  const introCampaignEdit = useSelector(state => state.sessionManager.introCampaignEdit);
  const campaignData = useSelector (state => state.campaignData);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const passwordResetError = useSelector(state => state.sessionManager.errorPasswordReset);
  const emailSignInError = useSelector(state => state.sessionManager.errorEmailSignIn);
  const googleSignInError = useSelector(state => state.sessionManager.errorGoogleSignIn);

  const passwordResetMsg = showPasswordResetMsg 
    ? emailInput 
      ? passwordResetError 
      : "enter email above"
    : "";

  const displayNameInputRef = useRef("displayNameInput");

  // FUNCTIONS
  const emailSignIn = (event) => { 
    event.preventDefault(); 
    if (introCampaignEdit) {
      let save = window.confirm("Would you like to save your work as a new campaign?");
      if (save) {
        dispatch(fireactions.emailSignIn(emailInput, pswInput, 
          () => dispatch(fireactions.saveIntroCampaignData(campaignData))
        ));
      } else {
        dispatch(fireactions.emailSignIn(emailInput, pswInput));
      }
      dispatch(actions.setIntroCampaignEdit(false));
    } else {
      dispatch(fireactions.emailSignIn(emailInput, pswInput));
    }
  };

  const googleSignIn = (event) => { 
    event.preventDefault(); 
    dispatch(fireactions.googleSignIn());
  };

  const emailSignOut = (event) => { 
    event.preventDefault(); 
    if (activeCampaignId) {
      dispatch(actions.setStatus('saving'));
      dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData, 
        () => {
          dispatch(actions.setStatus('idle'));
          dispatch(fireactions.emailSignOut());
        }
      ));
    } else {
      dispatch(fireactions.emailSignOut());
    }
    setShowUserDropdown(false);
  };

  const sendPasswordResetEmail = () => {
    dispatch(fireactions.sendPasswordResetEmail(emailInput));
    setShowPasswordResetMsg(true);
  };
  
  const keyPressDisplayNameHandler = (event) => {
    if (showDisplayInput && event.key === 'Enter') {
      dispatch(fireactions.updateDisplayName(displayNameInput));
      setShowDisplayInput(false);
      setDisplayNameInput("");
    }
  };

  useOutsideClick([displayNameInputRef], showDisplayInput, () => setShowDisplayInput(false));
  
  // On sign in or sign out
  useEffect(() => {
    if (userId) {
      setShowUserDropdown(false);
      setEmailInput("");
      setPswInput("");
      setShowPasswordResetMsg(false);
      setShowDisplayInput(false);
      setDisplayNameInput("");
    }
  }, [userId, setEmailInput, setPswInput, setShowUserDropdown]);

  const signInContainer = (
    <div className="sign-in-dropdown">
      {/* email sign in */}
      <div className="email-sign-in-form dropdown-item">
        Sign in with Email
        <form onSubmit={e => emailSignIn(e)}>
          <div className="form-row">
            <input type="email" placeholder="Email..." name="email" required 
              value={emailInput} 
              onChange={e => setEmailInput(e.target.value)} />
          </div>
          <div className="form-row">
            <input type="password" placeholder="Password..." name="psw" required 
              value={pswInput} 
              onChange={e => setPswInput(e.target.value)} />
          </div>
          <div className="form-row" style={{display: (emailSignInError !== "") ? "block" : "none"}}>
            <div className="err-msg">{emailSignInError}</div>
          </div>
          <div className="form-row">
            <button className="sign-in btn-any" type="submit">Sign In</button>
            <div className="forget-password"
              onClick={sendPasswordResetEmail}>
              Forget your password?
            </div>
          </div>
          <div className="form-row" style={{display: (passwordResetMsg !== "") ? "block" : "none"}}>
            <div className="err-msg">{passwordResetMsg}</div>
          </div>
        </form>
      </div>
      <button className="google-sign-in dropdown-item btn-any" 
        onClick={e => googleSignIn(e)}>
        Sign In with Google
        <div className="sign-in-error" style={{display: (googleSignInError !== "") ? "block" : "none"}}>{googleSignInError}</div>
      </button>
      <button className="sign-up dropdown-item btn-any"
        onClick={()=>{setShowSignUp(true); setShowUserDropdown(false);}}>
        Sign Up with Email
      </button>
    </div>
  );

  const signOutContainer = (
    <div className="sign-out-dropdown">
      <div className="signed-in-with dropdown-item" title={"Signed in with "+email}>Signed in with {email}</div>
      <button ref={displayNameInputRef} className="display-name dropdown-item btn-any"
        onClick={() => setShowDisplayInput(true)}>
        Change display name
        {showDisplayInput 
          ? <input className="display-name-input"
              value={displayNameInput}
              onChange={e => setDisplayNameInput(e.target.value)}
              onKeyDown={e => keyPressDisplayNameHandler(e)} /> 
          : null}
      </button>
      <button className="sign-out dropdown-item btn-any" 
        onClick={e => emailSignOut(e)}>
        Sign Out
      </button>
    </div>
  );

  return (userId ? signOutContainer : signInContainer);
};

export default AuthDropdown;