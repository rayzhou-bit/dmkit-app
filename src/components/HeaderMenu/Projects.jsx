import React from 'react';

import { useProjectHooks } from './hooks';
import ProjectItem from './ProjectItem';

import './index.scss';
import NewProjectIcon from '../../assets/icons/new-project.svg';
import DropdownArrowIcon from '../../assets/icons/dropdown-arrow.svg';

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

  let projectsList = [
    <ProjectItem
      id={activeProjectId}
      key={activeProjectId}
      name={projects[activeProjectId]}
      closeProjectDropdown={closeProjectDropdown}
    />,
  ];
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
        <ul>
          {projectsList}
          <li key='new'>
            <div
              className='new-project'
              onClick={newProject}
            >
              <span>Create new project</span>
              <div/>
              <img src={NewProjectIcon} />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Projects;