import React, { useRef } from 'react';

import './index.scss';
import { useOutsideClick } from '../../shared/utilityFunctions';
import { PopupKeys } from './PopupKey';
import * as Card from '../../components/Card/DeleteConfirmation';

/*
  There can only be one pop up on the screen at a time, so
  the Popup component should only be called from /src/App.js.
  The popup type is stored in the redux state.
    An empty type means there is no popup.
    There can be types such as card, tab and more.
*/

export const Popup = ({
  resetCallback,
  type,
}) => {
  const popupRef = useRef();

  useOutsideClick([popupRef], true, () => resetCallback());

  if (!type) return null;

  let pop;
  switch (type) {
    case PopupKeys.CONFIRM_CARD_DELETE:
      pop = <Card.DeleteConfirmation />
      break;
    case PopupKeys.CONFIRM_TAB_DELETE:
      // TODO
      break;
    default: return null;
  }

  return (
    <div className='popup-wrapper' ref={popupRef}>
      {pop}
    </div>
  );
};

export default Popup;
