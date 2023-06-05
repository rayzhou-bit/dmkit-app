import React from 'react';

import './index.scss';
import { PopupKeys } from './PopupKey';
import * as Card from '../../components/Card/DeleteConfirmation';

export const Popup = ({
  resetCallback,
  type,
}) => {
  // The popup displayed here depends on type.
  //   An empty string means there should be no popup.
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
    <div className='wrapper' onClick={resetCallback}>
      {pop}
    </div>
  );
};

export default Popup;
