import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { PopupKeys } from '../Popup/PopupKey';

import Title from './Title';
import VersionControls from './VersionControls';
import Projects from './Projects';
import UserOptions from './UserOptions';
import SignIn from './SignIn';

import './index.scss';
import ToggleLeft from '../../assets/icons/toggle-left.svg';
import ToggleRight from '../../assets/icons/toggle-right.svg';

const HeaderMenu = () => {
  const dispatch = useDispatch();

  const userId = useSelector(state => state.userData.userId);

  return (
    <>
      <div className='header-menu'>
        {/* expand toolbar button - TODO: the below is a placeholder until toolbar is redone */}
        <div className='expand'>
          <img alt='expand left' src={ToggleLeft} />
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