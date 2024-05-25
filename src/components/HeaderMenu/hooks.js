import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useOutsideClick from '../../utils/useOutsideClick';
import { convertToMsg } from '../../data/api/authCodes';

import { actions } from '../../data/redux';
import { undo, redo } from '../../data/redux';
import * as api from  '../../data/api/database';
import * as authApi from '../../data/api/auth';
import * as userApi from '../../data/api/user';

import { NETWORK_STATUS } from '../../data/redux/session/constants';
import { POPUP_KEYS } from '../Popup/PopupKey';

export const SAVE_BUTTON = {
  enabled: 'enabled',
  disabled: 'disabled',
  pending: 'pending',
  saving: 'saving',
  completed: 'completed',
};

export const useTitleHooks = () => {
  const dispatch = useDispatch();

  const id = useSelector(state => state.session.activeCampaignId);
  const title = useSelector(state => state.project.present.title || '');
  const [ isEditable, setIsEditable ] = useState(false);

  const startEdit = () => setIsEditable(true);
  const endEdit = () => {
    document.getSelection().removeAllRanges();
    setIsEditable(false);
  };

  return {
    title,
    onChange: (newValue) => {
      if (newValue !== title) {
        dispatch(actions.project.updateProjectTitle({ title: newValue }));
        dispatch(actions.session.updateProjectTitle({ id, title: newValue }));
      }
    },
    isEditable,
    startEdit,
    endEdit,
    handleKeyPress: (event) => {
      if (event.key === 'Enter' || event.key === 'Tab') {
        endEdit();
      }
    },
  };
};

export const useVersionControlHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.userId || '');
  const status = useSelector(state => state.session.status || NETWORK_STATUS.idle);
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const projectData = useSelector(state => state.project.present || {});
  const pastProjectData = useSelector(state => state.project.past || {});
  const futureProjectData = useSelector(state => state.project.future || {});
  const [ saveCompleted, setSaveCompleted ] = useState(false);

  let saveButtonStatus = SAVE_BUTTON.enabled;
  if (status === NETWORK_STATUS.saving) {
    saveButtonStatus = SAVE_BUTTON.saving;
  } else if (!((status === NETWORK_STATUS.idle) && userId && activeProject)) {
    saveButtonStatus = SAVE_BUTTON.disabled;
  // } else if (pending??) {
  //   saveButtonStatus = SAVE_BUTTON.pending;  // (there are multiple changes since last save; currently not implemented)
  } else if (saveCompleted) {
    saveButtonStatus = SAVE_BUTTON.completed;
  }

  return {
    undo,
    disableUndo: pastProjectData.length === 0,
    redo,
    disableRedo: futureProjectData.length === 0,
    save: () => {
      dispatch(api.save(activeProject, projectData, () => {
        setSaveCompleted(true);
      }));
    },
    saveButtonStatus,
  };
};

export const useProjectHooks = () => {
  const dispatch = useDispatch();
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const projects = useSelector(state => state.session.campaignList || []);
  const projectData = useSelector(state => state.project.present || {});
  const [ showProjectDropdown, setShowProjectDropdown ] = useState(false);
  const [ deleteBtnIcon, setDeleteBtnIcon ] = useState();
  const btnRef = useRef();
  const dropdownRef = useRef();

  useOutsideClick(
    [btnRef, dropdownRef],
    showProjectDropdown,
    () => setShowProjectDropdown(false),
  );

  const sortedProjectIdsByName = Object.keys(projects).sort((a, b) => projects[a].localeCompare(projects[b]));
  const sortedProjects = {};
  sortedProjectIdsByName.forEach(id => {
    sortedProjects[id] = projects[id];
  });
  
  return {
    btnRef,
    dropdownRef,
    showProjectDropdown,
    openProjectDropdown: () => setShowProjectDropdown(true),
    closeProjectDropdown: () => setShowProjectDropdown(false),
    activeProject,
    activeProjectName: projectData.title,
    projects: sortedProjects,
    newProject: () => {
      if (!!activeProject) {
        dispatch(api.save(activeProject, projectData, () => {
          dispatch(api.createAndSwitchToEmptyProject());
        }));
      } else {
        dispatch(api.createAndSwitchToEmptyProject());
      }
    },
  };
};

export const useProjectItemHooks = ({ closeProjectDropdown, id, name }) => {
  const dispatch = useDispatch();
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const projectData = useSelector(state => state.project.present || {});
  const [ confirmDelete, setConfirmDelete ] = useState(false);
  const deleteBtnRef = useRef();

  const isActiveProject = id === activeProject;

  useOutsideClick([deleteBtnRef], confirmDelete, setConfirmDelete, false);

  return {
    deleteBtnRef,
    isActiveProject,
    switchProject: () => {
      if (!!activeProject) {
        dispatch(api.save(activeProject, projectData, () => {
          dispatch(api.switchProject(id));
        }));
      } else {
        dispatch(api.switchProject(id));
      }
      closeProjectDropdown();
    },
    copyProject: (event) => {
      event.stopPropagation();
      dispatch(api.copyProject(id, () => {
        dispatch(api.fetchProjects());
      }));
    },
    confirmDeleteProject: (event) => {
      event.stopPropagation();
      dispatch(actions.session.setPopup({
        type: POPUP_KEYS.confirmProjectDelete,
        id,
        name,
        isActiveProject,
      }));
    }
  };
};

export const useUserOptionsHooks = () => {
  const dispatch = useDispatch();
  const email = useSelector(state => state.user.email || '');
  const projectData = useSelector (state => state.project.present || {});
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const [ showUserOptionsDropdown, setShowUserOptionsDropdown ] = useState(false);
  const btnRef = useRef();
  const dropdownRef = useRef();

  useOutsideClick(
    [btnRef, dropdownRef],
    showUserOptionsDropdown,
    () => setShowUserOptionsDropdown(false),
  );

  return {
    btnRef,
    dropdownRef,
    showUserOptionsDropdown,
    openUserOptionsDropdown: () => setShowUserOptionsDropdown(true),
    closeUserOptionsDropdown: () => setShowUserOptionsDropdown(false),
    email,
    logOut: (event) => {
      event.preventDefault();
      if (!!activeProject) {
        dispatch(api.save(activeProject, projectData, () => {
          dispatch(authApi.emailSignOut());
        }));
      } else {
        dispatch(authApi.emailSignOut());
      }
    },
  };
};

export const useDisplayNameHooks = () => {
  const dispatch = useDispatch();
  const username = useSelector(state => state.user.displayName || '');
  const [ showDisplayNameInput, setShowDisplayInput ] = useState(false);
  const [ displayNameInput, setDisplayNameInput ] = useState('');
  const inputRef = useRef();

  const endDisplayNameInputEdit = () => {
    document.getSelection().removeAllRanges();
    if (displayNameInput !== username && displayNameInput !== '') {
      dispatch(actions.user.updateUserDisplayName({ displayName: displayNameInput }));
      dispatch(userApi.updateDisplayName(displayNameInput));
    }
    setShowDisplayInput(false);
  };

  return {
    inputRef,
    username,
    displayNameInput,
    showDisplayNameInput,
    openDisplayNameInput: () => setShowDisplayInput(true),
    changeDisplayNameInput: (newValue, event) => {
      setDisplayNameInput(newValue)
    },
    handleDisplayNameInputKeyPress: (event) => {
      if (event.key === 'Enter') {
        endDisplayNameInputEdit();
      }
    },
  };
};

export const useSignInHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.userId || '');
  const [ showSignInDropdown, setShowSignInDropdown ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ emailError, setEmailError ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordError, setPasswordError ] = useState('');
  const [ forgotPasswordScreen, setForgotPasswordScreen ] = useState(null);
  const [ authError, setAuthError ] = useState('');
  const signInBtnRef = useRef();
  const signInDropdownRef = useRef();

  // Initialize sign in form
  useEffect(() => {
    if (!!userId) {
      setShowSignInDropdown(false);
      setEmail('');
      setPassword('');
    }
  }, [userId]);

  useOutsideClick(
    [signInBtnRef, signInDropdownRef],
    showSignInDropdown,
    () => {
      setShowSignInDropdown(false);
      setEmailError('');
      setPasswordError('');
      setAuthError('');
      setForgotPasswordScreen(null);
    },
  );

  const signInViaEmail = (event) => {
    event.preventDefault();
    setEmailError('');
    setPasswordError('');
    setAuthError('');
    dispatch(authApi.emailSignIn({
      email,
      password,
      callback: () => setAuthError(''),
      errorCallback: errorCode => setAuthError(convertToMsg({ errorCode })),
    }));
  };

  return {
    signInBtnRef,
    signInDropdownRef,
    showSignInDropdown,
    openSignInDropdown: () => setShowSignInDropdown(true),
    closeSignInDropdown: () => {
      setShowSignInDropdown(false);
      setForgotPasswordScreen(null);
    },

    email,
    onChangeEmail: (event) => {
      setEmail(event.target.value);
      setEmailError('');
    },
    emailClassName: ''.concat(
      emailError ? ' error' : '',
      authError ? ' auth-error' : '',
    ),
    emailError,
    emailOnInvalid: (event) => {
      event.preventDefault();
      setEmailError(event.target.validationMessage);
    },

    password,
    onChangePassword: (event) => {
      setPassword(event.target.value);
      setPasswordError('');
    },
    passwordClassName: ''.concat(
      passwordError ? ' error' : '',
      authError ? ' auth-error' : '',
    ),
    passwordError,
    passwordOnInvalid: (event) => {
      event.preventDefault();
      setPasswordError(event.target.validationMessage);
    },

    forgotPasswordScreen,
    openForgotPasswordScreen: (event) => {
      event.preventDefault();
      setForgotPasswordScreen('submit');
    },
    sendPasswordReset: (event) => {
      event.preventDefault();
      dispatch(authApi.sendPasswordResetToEmail({
        email,
        callback: () => setForgotPasswordScreen('success'),
        errorCallback: () => setForgotPasswordScreen('failure'),
      }));
    },

    signInViaEmail,
    signInViaGoogle: (event) => {
      event.preventDefault();
      dispatch(authApi.googleSignIn({}));
    },
    authError,
    clearAuthError: () => setAuthError(''),
  };
};

export const useSignUpHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.userId || '');
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ emailError, setEmailError ] = useState('');
  const [ passwordError, setPasswordError ] = useState('');
  const [ authError, setAuthError ] = useState('');

  // Initialize sign up form
  useEffect(() => {
    if (!!userId) {
      setEmail('');
      setPassword('');
    }
  }, [userId]);

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setAuthError('');
  };

  const signUpViaEmail = (event) => {
    event.preventDefault();
    clearErrors();
    dispatch(authApi.emailSignUp({
      email,
      password,
      callback: () => clearErrors(),
      errorCallback: errorCode => setAuthError(convertToMsg({ errorCode })),
    }));
  };

  const signUpViaGoogle = (event) => {
    event.preventDefault();
    clearErrors();
    dispatch(authApi.googleSignIn({
      callback: () => dispatch(actions.session.resetPopup()),
      errorCallback: errorCode => setAuthError(convertToMsg({ errorCode })),
    }));
  };

  return {
    email,
    onChangeEmail: (event) => {
      setEmail(event.target.value);
      setEmailError('');
    },
    emailClassName: ''.concat(
      emailError ? ' error' : '',
      authError ? ' auth-error' : '',
    ),
    emailError,
    emailOnInvalid: (event) => {
      event.preventDefault();
      setEmailError(event.target.validationMessage);
    },

    password,
    onChangePassword: (event) => {
      setPassword(event.target.value);
      setPasswordError('');
    },
    passwordClassName: ''.concat(
      passwordError ? ' error' : '',
      authError ? ' auth-error' : '',
    ),
    passwordError,
    passwordOnInvalid: (event) => {
      event.preventDefault();
      setPasswordError(event.target.validationMessage);
    },

    signUpViaEmail,
    signUpViaGoogle,
    authError,
    clearAuthError: () => setAuthError(''),
  };
};
