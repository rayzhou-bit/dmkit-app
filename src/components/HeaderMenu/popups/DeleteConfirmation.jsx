import React from 'react';
import { useDispatch } from 'react-redux';

import './DeleteConfirmation.scss';
import * as actions from '../../../store/actionIndex';
import * as fireactions from '../../../store/firestoreIndex';

export const DeleteConfirmation = ({
  id,
  isActiveProject,
  name,
}) => {
  const dispatch = useDispatch();

  const cancelClick = () => dispatch(actions.resetPopup());
  const confirmClick = () => {
    dispatch(fireactions.destroyProject({
      projectId: id,
      callback: isActiveProject
        ? () => {
          dispatch(fireactions.switchProject({ projectId: null }));
          dispatch(actions.unloadCampaignData());
        }
        : null,
    }));
    dispatch(actions.resetPopup());
  };

  return (
    <div className='project-delete-confirmation'>
      <div className='row'>
        <h1 className='heading'>Delete Project</h1>
      </div>
      <div className='row'>
        <p className='message'>Are you sure you want to delete this project?</p>
      </div>
      <div className='row'>
        <span className='project-name'>{name}</span>
      </div>
      <div className='row'>
        <button className='cancel btn' onClick={cancelClick}>
          Cancel
        </button>
        <button className='confirm btn' onClick={confirmClick}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
