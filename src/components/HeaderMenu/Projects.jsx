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
    activeProjectName,
    projects,
    newProject,
  } = useProjectHooks();

  let projectsList = [];
  if (!!activeProject) {
    projectsList = [
      ...projectsList,
      <li key={activeProject} className='project-li'>
        <ProjectItem
          id={activeProject}
          name={activeProjectName}
          closeProjectDropdown={closeProjectDropdown}
        />
      </li>,
    ];
  }
  for (let project in projects) {
    if (project !== activeProject) {
      const name = projects[project];
      projectsList = [
        ...projectsList,
        <li key={project} className='project-li'>
          <ProjectItem
            id={project}
            name={name}
            closeProjectDropdown={closeProjectDropdown}
          />
        </li>,
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
        <span className='button-text'>Projects</span>
        <img className='img-arrow' />
      </button>
      <div
        className='header-dropdown project-dropdown'
        ref={dropdownRef}
        style={{ display: showProjectDropdown ? 'block' : 'none' }}
      >
        <div
          className='list-of-projects'
          style={{ overflowY: (Object.keys(projects).length > 5) ? 'scroll' : 'hidden' }}
        >
          <ul className='projects-ul'>
            {projectsList}
          </ul>
        </div>
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