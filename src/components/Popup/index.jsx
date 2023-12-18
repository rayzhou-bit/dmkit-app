import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { PopupKeys } from './PopupKey';

import * as Card from '../Card/popups/DeleteConfirmation';
import * as Project from '../HeaderMenu/popups/DeleteConfirmation';
import SignUp from '../HeaderMenu/popups/SignUp';

import './index.scss';

/*
  There can only be one pop up on the screen at a time, so
  the Popup component should only be called from /src/App.js.
  The popup type is stored in the redux state.
    An empty type means there is no popup.
    There can be types such as card, tab and more.
*/

export const Popup = () => {
  const dispatch = useDispatch();
  const popup = useSelector(state => state.sessionManager.popup);
  const popupRef = useRef();

  if (!popup || !popup.type) {
    return null;
  }

  const element = () =>{
    switch (popup.type) {
      case PopupKeys.CONFIRM_CARD_DELETE:
        return <Card.DeleteConfirmation {...popup} />;
      case PopupKeys.CONFIRM_TAB_DELETE:
        // TODO
        return null;
      case PopupKeys.CONFIRM_PROJECT_DELETE:
        return <Project.DeleteConfirmation {...popup} />;
      case PopupKeys.SIGN_UP:
        return <SignUp />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className='popup-wrapper' ref={popupRef}>
        {element()}
      </div>
      <div
        className='backdrop'
        onClick={(event) => {
          event.preventDefault();
          dispatch(actions.resetPopup());
        }}
      />
    </>
  );
};

export default Popup;