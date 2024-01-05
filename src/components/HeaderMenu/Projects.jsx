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
    activeProject,
    projects,
    newProject,
  } = useProjectHooks();

  let projectsList = activeProject
    ? [
        <ProjectItem
          id={activeProject}
          key={activeProject}
          name={projects[activeProject]}
          closeProjectDropdown={closeProjectDropdown}
        />,
      ]
    : [];
  for (let project in projects) {
    if (project !== activeProject) {
      const name = projects[project];
      projectsList = [
        ...projectsList,
        <ProjectItem
          id={project}
          key={project}
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
        className='header-dropdown'
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