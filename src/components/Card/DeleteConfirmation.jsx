import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './DeleteConfirmation.scss';
import { resetPopup, destroyCard } from '../../store/actionIndex';

export const DeleteConfirmation = ({
}) => {
  const dispatch = useDispatch();

  const cardId = useSelector(state => state.sessionManager.popup.id);

  const cancelClick = () => dispatch(resetPopup());
  const confirmClick = () => {
    console.log('test', cardId)
    dispatch(destroyCard(cardId));
    dispatch(resetPopup());
  };

  return (
    <div className='delete-confirmation'>
      <div className='x-btn' onClick={cancelClick} />
      <div className='row'>
        <h1 className='heading'>Game Master!</h1>
      </div>
      <div className='row'>
        <p className='message'>Are you sure you want to delete this card?</p>
      </div>
      <div className='row'>
        <button className='cancel btn' onClick={cancelClick}>
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
