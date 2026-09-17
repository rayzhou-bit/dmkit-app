import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '../../../data/redux';
import { destroySelectedCards } from '../../../data/redux/thunkActions';

import './DeleteConfirmation.scss';

export const DeleteConfirmation = ({
  ids,
}) => {
  const dispatch = useDispatch();
  const activeCardId = useSelector(selectors.session.activeCard);
  const count = ids.length;

  const cancelClick = () => dispatch(actions.session.resetPopup());
  const confirmClick = () => {
    dispatch(destroySelectedCards({ ids, activeCardId }));
    dispatch(actions.session.resetPopup());
  };

  return (
    <div className='card-delete-confirmation'>
      <div className='x-btn' onClick={cancelClick} />
      <div className='row'>
        <span className='heading'>
          {count === 1 ? 'Delete Card' : `Delete ${count} Cards`}
        </span>
      </div>
      <div className='row'>
        <span className='message'>
          {count === 1
            ? 'Are you sure you want to delete this card?'
            : `Are you sure you want to delete these ${count} cards?`}
        </span>
      </div>
      <div className='row'>
        <button className='cancel-btn' onClick={cancelClick}>
          Cancel
        </button>
        <button className='confirm-btn' onClick={confirmClick}>
          OK
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
