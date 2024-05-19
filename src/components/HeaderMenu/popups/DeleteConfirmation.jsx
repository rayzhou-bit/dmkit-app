import React from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../../../data/redux';
import * as api from '../../../data/api/database';

import './DeleteConfirmation.scss';

export const DeleteConfirmation = ({
  id,
  isActiveProject,
  name,
}) => {
  const dispatch = useDispatch();

  const cancelClick = () => dispatch(actions.session.resetPopup());
  const confirmClick = () => {
    dispatch(api.destroyProject(id, () => {
      dispatch(actions.session.removeProject({ id }));
      if (isActiveProject) {
        dispatch(actions.session.setActiveProject({ id: null }));
        dispatch(actions.project.unloadProject());
      }
    }));
    dispatch(actions.session.resetPopup());
  };

  return (
    <div className='project-delete-confirmation'>
      <div className='row'>
        <h1 className='heading'>Delete Project</h1>
      </div>
      <div className='row'>
        <p className='message'>
          Are you sure you want to delete this project?
          <br/>
          All your library cards will also be deleted.
        </p>
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
