import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';

import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import { useOutsideClick } from '../../shared/utils';
import store from '../../data/store';

import './HeaderBar.scss';
import Menu from '../UI/Menu/Menu';
import CampaignList from './CampaignList/CampaignList';
import AuthDropdown from './AuthDropdown/AuthDropdown';
import SignUp from './SignUp/SignUp';

import UndoImg from '../../assets/icons/undo.png';
import RedoImg from '../../assets/icons/redo.png';
import SaveImg from '../../assets/icons/save.png';

const HeaderBar = props => {
  const dispatch = useDispatch();

  // STATES
  const [titleValue, setTitleValue] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [showCampaignsDropdown, setShowCampaignsDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const displayName = useSelector(state => state.userData.displayName);
  const email = useSelector(state => state.userData.email);
  const status = useSelector(state => state.sessionManager.status);
  const campaignList = useSelector(state => state.sessionManager.campaignList);
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

  // FUNCTIONS: DROPDOWNS
  const campaignDropdownHandler = () => {
    dispatch(fireactions.fetchCampaignList());
    setShowCampaignsDropdown(!showCampaignsDropdown);
  };

  useOutsideClick([campaignDropdownBtnRef, campaignDropdownContentRef], showCampaignsDropdown, () => setShowCampaignsDropdown(false));
  useOutsideClick([authDropdownBtnRef, authDropdownContentRef], showSettingsDropdown, () => setShowSettingsDropdown(false));

  // FUNCTIONS: CAMPAIGN
  const switchCampaign = (c) => {
    if (activeCampaignId) {
      if (activeCampaignId !== c) {
        dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData, 
          dispatch(fireactions.switchCampaign(c))));
      }
    } else dispatch(fireactions.switchCampaign(c));
  };

  // DISPLAY ELEMENTS
  let campaigns = [];
  if (userId) {
    for (let campaignId in campaignList) {
      campaigns = [
        ...campaigns,
        [campaignList[campaignId], () => {
            switchCampaign(campaignId);
            setShowCampaignsDropdown(false);
          }
        ]
      ];
    }
  }

  let settings = [];

  return (
    <>
      <div className="header-bar">
        {/* title */}
        <input ref={titleInputRef} className="title"
          type="text" required maxLength="100"
          value={titleValue ? titleValue : ""} title={titleValue ? titleValue : ""} readOnly={!editingTitle}
          onBlur={endTitleEdit}
          onClick={beginTitleEdit}
          onChange={e => setTitleValue(e.target.value)}
          onKeyDown={titleKeyPressHandler}
          onDragOver={e => e.preventDefault()}
        />

        <div className="btn-container">
          {/* undo button */}
          <button className="header-btn btn-any"
            disabled={pastCampaignData.length === 0}
            onClick={() => store.dispatch(ActionCreators.undo())}>
            <p>undo</p>
            <img src={UndoImg} alt="Undo" draggable="false" />
          </button>
          {/* redo button */}
          <button className="header-btn btn-any"
            disabled={futureCampaignData.length === 0}
            onClick={() => store.dispatch(ActionCreators.redo())}>
            <p>redo</p>
            <img src={RedoImg} alt="Redo" draggable="false" />
          </button>
          {/* save button */}
          <button className="save-btn header-btn btn-any"
            disabled={disableSave}
            onClick={saveEditedData}>
            <p>{ (status === 'saving') ? "saving.." : "save" }</p>
            <img src={SaveImg} alt="Save" draggable="false" />
          </button>
          
          {/* campaign open */}
          <button ref={campaignDropdownBtnRef} className="header-btn btn-any"
            onClick={campaignDropdownHandler}>
            <p>campaigns</p>
            {/* campaign list dropdown */}
            <div ref={campaignDropdownContentRef} className="campaign-container"
              style={{display: showCampaignsDropdown ? "block" : "none"}}>
              <Menu options={campaigns} />
            </div>
          </button>

          {/* settings open */}
          <button ref={authDropdownBtnRef} className="header-btn btn-any"
            onClick={()=>setShowSettingsDropdown(!showSettingsDropdown)}>
            <p>{userId ? "settings" : "signup"}</p>
            {/* settings dropdown */}
            <div ref={authDropdownContentRef} className="settings-container" 
              style={{display: showSettingsDropdown ? "block" : "none"}}>
              <AuthDropdown setShowSignUp={setShowSignUp} setShowSettingsDropdown={setShowSettingsDropdown} />
            </div>
          </button>
        </div>
      </div>

      {/* sign up pop up */}
      <SignUp showSignUp={showSignUp} onBackdropClick={()=>setShowSignUp(false)} />
    </>
  );
};

export default HeaderBar;