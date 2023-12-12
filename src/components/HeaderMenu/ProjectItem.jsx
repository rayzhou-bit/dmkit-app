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
    deleteProject,
  } = useProjectItemHooks({ closeProjectDropdown, id });

  const [deleteDisplayIcon, setDeleteDisplayIcon] = React.useState(DeleteIcon);

  return (
    <li key={id} className='project-li'>
      <div
        className={'project-container' + (isActiveProject ? ' active-proj' : '')}
        onClick={switchProject}
      >
        <span className='project-name'>{name}</span>
        <button className='copy' onClick={copyProject}>
          <img src={CopyIcon} />
        </button>
        <button
          className='delete'
          ref={deleteBtnRef}
          onClick={deleteProject}
          onMouseOver={e => setDeleteDisplayIcon(DeleteRedIcon)}
          onMouseOut={e => setDeleteDisplayIcon(DeleteIcon)}
        >
          <img src={deleteDisplayIcon} />
        </button>
        <div className={'back' + (isActiveProject ? ' active' : '')} />
      </div>
    </li>
  );
};

export default ProjectItem;
