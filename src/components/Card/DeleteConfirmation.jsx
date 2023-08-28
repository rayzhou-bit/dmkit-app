import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './DeleteConfirmation.scss';
import { resetPopup, destroyCard } from '../../store/actionIndex';

export const DeleteConfirmation = ({
}) => {
  const dispatch = useDispatch();

  const cardId = useSelector(state => state.sessionManager.popup.id);

  const confirmClick = () => {
    console.log('test', cardId)
    dispatch(destroyCard(cardId));
    dispatch(resetPopup());
  };

  return (
    <div className='delete-confirmation'>
      <div className='x-btn' onClick={() => dispatch(resetPopup())} />
      <div className='row'>
        <h1>Game Master!</h1>
      </div>
      <div className='row'>
        <p>Are you sure you want to delete this card?</p>
      </div>
      <div className='row'>
        <button className='cancel btn' onClick={() => dispatch(resetPopup())}>
          Cancel
        </button>
        <button className='confirm btn' onClick={confirmClick}>
          OK
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
