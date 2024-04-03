import React from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../../../data/redux';

import './DeleteConfirmation.scss';

export const DeleteConfirmation = ({
  id,
}) => {
  const dispatch = useDispatch();

  const cancelClick = () => dispatch(actions.session.resetPopup());
  const confirmClick = () => {
    dispatch(actions.project.destroyTab({ id }));
    dispatch(actions.session.resetPopup());
  };

  return (
    <div className='card-delete-confirmation'>
      <div className='x-btn' onClick={cancelClick} />
      <div className='row'>
        <h1 className='heading'>Game Master!</h1>
      </div>
      <div className='row'>
        <p className='message'>Are you sure you want to delete this tab?</p>
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
