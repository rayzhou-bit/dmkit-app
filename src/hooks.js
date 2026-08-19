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
  // `isProjectEdited` is set by the effect below on every change to
  // `_latestUnfiltered`, which includes loads and pan/zoom - so it is true
  // even when the user has changed nothing. redux-undo's `past` only grows on
  // the allowlisted edit actions (see data/redux/index.js) and is emptied by
  // clearHistory() after every load, so it is the honest "user edited
  // something" signal, and the only one worth writing to Firebase for.
  const hasLocalEdits = useSelector(state => (state.project.past?.length ?? 0) > 0);
  const isLoggedIn = !!userId;

  // Read at auth-callback fire time, not at mount. The auth listener is
  // deliberately subscribed exactly once (re-subscribing would make Firebase
  // re-fire its initial callback and re-run the load path), so it cannot close
  // over these values directly without going stale.
  const pendingProjectRef = useRef({ saveProject: false, projectId: '', projectData: {} });
  pendingProjectRef.current = {
    saveProject: isProjectEdited && hasLocalEdits,
    projectId: activeProject,
    projectData,
  };

  // auth listener
  useEffect(() => {
    const unsubscribe = authListener({
      dispatch,
      getPendingProject: () => pendingProjectRef.current,
    });
    return () => unsubscribe();
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
