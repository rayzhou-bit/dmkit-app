import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions } from '../../data/redux';
import { POPUP_KEYS } from './PopupKey';

import * as Card from '../Card/popups/DeleteConfirmation';
import * as Tab from '../TabBar/popups/DeleteConfirmation';
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
  const popup = useSelector(state => state.session.popup);
  const popupRef = useRef();

  if (!popup || !popup.type) {
    return null;
  }

  const element = () =>{
    switch (popup.type) {
      case POPUP_KEYS.confirmCardDelete:
        return <Card.DeleteConfirmation {...popup} />;
      case POPUP_KEYS.confirmTabDelete:
        return <Tab.DeleteConfirmation {...popup} />;
      case POPUP_KEYS.confirmProjectDelete:
        return <Project.DeleteConfirmation {...popup} />;
      case POPUP_KEYS.signUp:
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
          dispatch(actions.session.resetPopup());
        }}
      />
    </>
  );
};

export default Popup;
