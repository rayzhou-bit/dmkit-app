import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { POPUP_KEYS } from '../Popup/PopupKey';

import Title from './Title';
import VersionControls from './VersionControls';
import Projects from './Projects';
import UserOptions from './UserOptions';
import SignIn from './SignIn';

import './index.scss';
import ToggleLeft from '../../assets/icons/toggle-left.svg';
import ToggleRight from '../../assets/icons/toggle-right.svg';

const ToolMenuButton = ({ isToolMenuOpen, toggleToolMenu }) => (
  <button className='expand' onClick={toggleToolMenu}>
    <img alt='expand left' src={isToolMenuOpen ? ToggleRight : ToggleLeft} />
  </button>
);

const HeaderMenu = ({
  isToolMenuOpen,
  toggleToolMenu,
}) => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.userData.userId);
  const activeProject = useSelector(state => state.sessionManager.activeCampaignId || '');

  return (
    <>
      <div className='header-menu'>
        { !!activeProject ? ToolMenuButton({isToolMenuOpen, toggleToolMenu}) : null }
        <Title />
        <VersionControls />
        { !!userId ? <Projects /> : null }
        {
          !!userId
          ? <UserOptions />
          : <>
              <SignIn />
              <button
                className='sign-up-btn'
                onClick={() => dispatch(actions.setPopup({
                  type: POPUP_KEYS.signUp,
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