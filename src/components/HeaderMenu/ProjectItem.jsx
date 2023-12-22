import React from 'react';

import { useProjectItemHooks } from './hooks';

import './index.scss';
import CopyIcon from '../../assets/icons/copy-project.svg';
import DeleteIcon from '../../assets/icons/delete.svg';
import DeleteRedIcon from '../../assets/icons/delete-red.svg';

const ProjectItem = ({ closeProjectDropdown, id, name }) => {
  const {
    deleteBtnRef,
    isActiveProject,
    switchProject,
    copyProject,
    confirmDeleteProject,
  } = useProjectItemHooks({ closeProjectDropdown, id, name });

  const [deleteDisplayIcon, setDeleteDisplayIcon] = React.useState(DeleteIcon);

  return (
    <li key={id} className='project-li'>
      <div
        className={'project-container' + (isActiveProject ? ' active-proj' : '')}
        onClick={!isActiveProject ? switchProject : null}
      >
        <span className='project-name'>
          {name}
        </span>
        <button className='copy' onClick={copyProject}>
          <img alt='Copy' src={CopyIcon} />
          <span className='tooltip'>Duplicate project</span>
        </button>
        <button
          className='delete'
          ref={deleteBtnRef}
          onClick={confirmDeleteProject}
          onMouseOver={e => setDeleteDisplayIcon(DeleteRedIcon)}
          onMouseOut={e => setDeleteDisplayIcon(DeleteIcon)}
        >
          <img alt='Delete' src={deleteDisplayIcon} />
        </button>
        <div className={'back' + (isActiveProject ? ' active' : '')} />
      </div>
    </li>
  );
};

export default ProjectItem;
