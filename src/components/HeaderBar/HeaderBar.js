import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { useOutsideClick } from '../../shared/utilityFunctions';

import './HeaderBar.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import { store } from '../../index';

import TitleInput from '../UI/Inputs/TitleInput';
import CampaignList from './CampaignList/CampaignList';
import AuthDropdown from './AuthDropdown/AuthDropdown';
import SignUp from './SignUp/SignUp';

import UndoImg from '../../assets/icons/undo-32.png';
import RedoImg from '../../assets/icons/redo-32.png';
import SaveImg from '../../assets/icons/save-32.png';

const HeaderBar = props => {
  const dispatch = useDispatch();

  // STATES
  const [titleValue, setTitleValue] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const displayName = useSelector(state => state.userData.displayName);
  const email = useSelector(state => state.userData.email);
  const status = useSelector(state => state.sessionManager.status);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignTitle = useSelector(state => state.campaignData.present.title);
  const campaignData = useSelector(state => state.campaignData.present);
  const pastCampaignData = useSelector(state => state.campaignData.past);
  const futureCampaignData = useSelector(state => state.campaignData.future);

  // REFS
  const titleInputRef = useRef();
  const campaignDropdownBtnRef = useRef();
  const campaignDropdownContentRef = useRef();
  const authDropdownBtnRef = useRef();
  const authDropdownContentRef = useRef();

  // FUNCTIONS: CAMPAIGN TITLE
  useEffect(() => {
    setTitleValue(campaignTitle);
  }, [setTitleValue, campaignTitle]);

  const beginTitleEdit = () => {
    if (!editingTitle) {
      setEditingTitle(true);
      titleInputRef.current.focus();
      titleInputRef.current.setSelectionRange(titleInputRef.current.value.length, titleInputRef.current.value.length);
    }
  };

  const endTitleEdit = () => {
    if (editingTitle) {
      document.getSelection().removeAllRanges();
      if (titleValue !== campaignTitle) dispatch(actions.updCampaignTitle(titleValue));
      setEditingTitle(false);
    }
  };

  const titleKeyPressHandler = (e) => {
    if (editingTitle) {
      if (e.key === 'Enter' || e.key === 'Tab') endTitleEdit();
    }
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
  
  // FUNCTIONS: SAVE
  const saveEditedData = () => {
    console.log("[Status] saving. Triggered by manual save.");
    dispatch(actions.setStatus('saving'));
    dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData,
      () => {
        console.log("[Status] idle. Triggered by manual save completion.");
        dispatch(actions.setStatus('idle'))
      }
    ));
  };

  let disableSave = ((status === 'idle') && userId && activeCampaignId) ? false : true;

  const saveTooltip = userId
    ? (status === 'saving')
      ? "Saving..."
      : "Save"
    : "Please create an account to save!";

  return (
    <>
      <div className="usermenu">
        {/* title */}
        <input ref={titleInputRef} className="usermenu-title"
          type="text" required maxLength="50"
          value={titleValue ? titleValue : ""} title={titleValue ? titleValue : ""} readOnly={!editingTitle}
          onBlur={endTitleEdit}
          onClick={beginTitleEdit}
          onChange={e => setTitleValue(e.target.value)}
          onKeyDown={titleKeyPressHandler}
          onDragOver={e => e.preventDefault()}
        />
        {/* <div className="dmkit-title">
          <TitleInput className="campaign-title-text" btnClassName="edit-title btn-32" 
            btnSize={32}
            value={campaignTitle} saveValue={v => dispatch(actions.updCampaignTitle(v))} />
        </div> */}

        {/* undo */}
        <button className="usermenu-btn btn-any"
          disabled={pastCampaignData.length === 0}
          onClick={() => store.dispatch(ActionCreators.undo())}>
          undo
          <img src={UndoImg} alt="Undo" draggable="false" />
          <span className="tooltip">{(userId && !activeCampaignId) ? "Please select a project first." : "Undo"}</span>
        </button>
        {/* redo */}
        <button className="usermenu-btn btn-any"
          disabled={futureCampaignData.length === 0}
          onClick={() => store.dispatch(ActionCreators.redo())}>
          redo
          <img src={RedoImg} alt="Redo" draggable="false" />
          <span className="tooltip">{(userId && !activeCampaignId) ? "Please select a project first." : "Redo"}</span>
        </button>
        {/* save */}
        <button className="usermenu-btn btn-any"
          disabled={disableSave}
          onClick={saveEditedData}>
          save
          {/* {(status === 'saving')
          ? <div className="spinner" />
          : <img src={SaveImg} alt="Save" draggable="false" />} */}
          <img src={SaveImg} alt="Save" draggable="false" />
          <span className="tooltip">{saveTooltip}</span>
        </button>
        
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
        {/* user settings / login */}
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

export default HeaderBar;