import React from 'react';

import { useProjectHooks } from './hooks';
import ProjectItem from './ProjectItem';

import './index.scss';
import NewProjectIcon from '../../assets/icons/new-project.svg';

const Projects = () => {
  const {
    btnRef,
    dropdownRef,
    showProjectDropdown,
    openProjectDropdown,
    closeProjectDropdown,
    activeProjectId,
    projects,
    newProject,
  } = useProjectHooks();

  let projectsList = activeProjectId 
  ? [
      <ProjectItem
        id={activeProjectId}
        key={activeProjectId}
        name={projects[activeProjectId]}
        closeProjectDropdown={closeProjectDropdown}
      />,
    ]
  : [];
  for (let id in projects) {
    if (id !== activeProjectId) {
      const name = projects[id];
      projectsList = [
        ...projectsList,
        <ProjectItem
          id={id}
          key={id}
          name={name}
          closeProjectDropdown={closeProjectDropdown}
        />,
      ];
    }
  }
  
  return (
    <div className='projects'>
      <button
        className='header-menu-btn'
        onClick={showProjectDropdown ? closeProjectDropdown : openProjectDropdown}
        ref={btnRef}
      >
        <span>Projects</span>
        <img />
      </button>
      <div
        className='dropdown'
        ref={dropdownRef}
        style={{ display: showProjectDropdown ? 'block' : 'none' }}
      >
        <ul className='projects-ul'>
          {projectsList}
        </ul>
        
        <div
          className='new-project'
          onClick={newProject}
        >
          <span>Create new project</span>
          <img src={NewProjectIcon} />
        </div>
      </div>
    </div>
  );
};

export default Projects;