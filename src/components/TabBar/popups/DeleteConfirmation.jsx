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
    <div className='tab-delete-confirmation'>
      <div className='x-btn' onClick={cancelClick} />
      <div className='row'>
        <span className='heading'>
          Delete Tab
        </span>
      </div>
      <div className='row'>
        <span className='message'>
          Are you sure you want to delete this tab?
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
