import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './index.scss';

import { resetPopup, destroyCard } from '../../store/actionIndex';

export const DeleteConfirmation = ({
}) => {
  const dispatch = useDispatch();

  const cardId = useSelector(state => state.sessionManager.popup.id);

  const confirmClick = () => {
    dispatch(destroyCard(cardId));
    dispatch(resetPopup());
  };

  // TODO make sure onClick from Popup does not propagate on delete window somehow.

  return (
    <div className='delete-confirmation'>
      <button className='x-btn' onClick={() => dispatch(resetPopup())}>
        x
      </button>
      <div className='confirmation-text'>
        <h1>Game Master!</h1>
        <p>Are you sure you want to delete this card?</p>
      </div>
      <button className='cancel-btn' onClick={() => dispatch(resetPopup())}>
        Cancel
      </button>
      <button className='confirm-btn' onClick={confirmClick}>
        OK
      </button>
    </div>
  );
};

export default DeleteConfirmation;