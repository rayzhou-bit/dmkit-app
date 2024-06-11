import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { authListener } from './data/api/auth';
import * as api from './data/api/database';
import { actions, clearHistory } from './data/redux';
import { NETWORK_STATUS } from './constants/states';

export const useListenerHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.userId);
  const status = useSelector(state => state.session.status || NETWORK_STATUS.idle);
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const isProjectEdited = useSelector(state => state.session.isProjectEdited);
  const projectData = useSelector(state => state.project.present || {});
  const projectChanges = useSelector(state => state.project._latestUnfiltered);
  const isLoggedIn = !!userId;

  // auth listener
  useEffect(() => {
    const listener = authListener({
      dispatch,
      saveProject: isProjectEdited,
      projectId: activeProject,
      projectData,
    });
    return () => listener();
  }, []);

  // load project when activeProject changes
  useEffect(() => {
    if (activeProject) {
      if (activeProject === 'intro_project_id') {
        dispatch(actions.project.loadIntroProject());
      } else if (activeProject === 'blank_project_id') {
        dispatch(actions.project.loadBlankProject());
      } else {
        dispatch(api.fetchProjectData(activeProject, () => {
          dispatch(clearHistory());
        }));
      }
    }
  }, [activeProject]);

  // set edit when project data changes
  useEffect(() => {
    dispatch(actions.session.setIsProjectEdited(true));
  }, [projectChanges])

  // auto-save every minute
  useEffect(() => {
    const autoSave = setInterval(() => {
      if ((status === NETWORK_STATUS.idle) && isLoggedIn && !!activeProject && isProjectEdited) {
        console.log('[auto-save] triggered');
        dispatch(api.save(activeProject, projectData));
      }
    }, 60000);
    return () => clearInterval(autoSave);
  }, [status, userId, activeProject, isProjectEdited, projectData]);
};

export const useMenuStateHooks = () => {
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const [ isToolMenuOpen, setIsToolMenuOpen ] = useState(!!activeProject);
  const toolMenuRef = useRef();

  useEffect(() => {
    setIsToolMenuOpen(!!activeProject);
  }, [activeProject]);

  return {
    toolMenuRef,
    isToolMenuOpen,
    toggleToolMenu: () => {
      if (activeProject) {
        setIsToolMenuOpen(!isToolMenuOpen);
      }
     },
  };
}
