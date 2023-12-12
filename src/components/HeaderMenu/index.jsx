import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import * as hooks from './hooks';
import { PopupKeys } from '../Popup/PopupKey';

import Title from './Title';
import VersionControls from './VersionControls';
import Projects from './Projects';
import UserOptions from './UserOptions';
import SignIn from './SignIn';

import './index.scss';
import ExpandLeft from '../../assets/icons/expand-left.png';
import ExpandRight from '../../assets/icons/expand-right.png';

const HeaderMenu = () => {
  const dispatch = useDispatch();

  const userId = useSelector(state => state.userData.userId);

  // STATES
  // const [showCampaignDropdown, setShowCampaignDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // STORE SELECTORS
  // const userId = useSelector(state => state.userData.userId);
  const displayName = useSelector(state => state.userData.displayName);
  const email = useSelector(state => state.userData.email);

  // REFS
  // const campaignDropdownBtnRef = useRef();
  // const campaignDropdownContentRef = useRef();
  const authDropdownBtnRef = useRef();
  const authDropdownContentRef = useRef();

  return (
    <>
      <div className='header-menu'>
        {/* expand toolbar button - TODO: the below is a placeholder until toolbar is redone */}
        <div className='expand'>
          <img alt='expand left' src={ExpandLeft} />
        </div>
        {/* title */}
        <Title saveValue={v => dispatch(actions.updCampaignTitle(v))} />
        {/* undo/redo/save buttons - TODO different states*/}
        <VersionControls />
        {/* projects */}
        {
          !!userId
          ? <Projects />
          : null
        }
        {/* user options */}
        {
          !!userId
          ? <UserOptions />
          : <>
              <SignIn />
              <button
                className='sign-up-btn'
                onClick={() => dispatch(actions.setPopup({
                  type: PopupKeys.SIGN_UP,
                }))}
              >
                <span>Sign Up</span>
              </button>
            </>
        }
      </div>
    </>
  );
};

export default HeaderMenu;