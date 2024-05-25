import React from 'react';

import { useProjectItemHooks, useTitleHooks } from './hooks';

import './index.scss';
import CopyIcon from '../../assets/icons/copy-project.svg';

const ProjectItem = ({
  closeProjectDropdown,
  id,
  name,
}) => {
  const {
    deleteBtnRef,
    isActiveProject,
    switchProject,
    copyProject,
    confirmDeleteProject,
  } = useProjectItemHooks({ closeProjectDropdown, id, name });

  const {
    onChange,
    isEditable,
    startEdit,
    endEdit,
    handleKeyPress,
  } = useTitleHooks();

  return (
    <div
      className={`project-item ${isActiveProject ? 'active-project' : ''}`}
      onClick={!isActiveProject ? switchProject : null}
    >
      <input
        className='project-name'
        maxLength='300'
        onBlur={endEdit}
        onChange={event => onChange(event.target.value)}
        onDoubleClick={startEdit}
        onDragOver={event => event.preventDefault()}
        onKeyDown={handleKeyPress}
        readOnly={!isActiveProject || !isEditable}
        spellCheck={false}
        style={{ backgroundColor: isEditable ? '#C1E9FF' : 'transparent'}}
        title={name}
        type='text'
        value={name}
      />
      <button className='copy' onClick={copyProject}>
        <img alt='Copy' src={CopyIcon} />
        <span className='tooltip'>Duplicate project</span>
      </button>
      <button
        className='delete'
        ref={deleteBtnRef}
        onClick={confirmDeleteProject}
      >
        <img alt='Delete' />
      </button>
      <div className={`back ${isActiveProject ? ' active' : ''}`} />
    </div>
  );
};

export default ProjectItem;
