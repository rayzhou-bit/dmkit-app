import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import useOutsideClick from '../../utils/useOutsideClick';
import { convertToMsg } from '../../data/authCodes';

import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import { store } from '../../index';
import { POPUP_KEYS } from '../Popup/PopupKey';

export const useTitleHooks = ({
  saveNewValue,
}) => {
  const value = useSelector(state => state.campaignData.present.title || '');
  const [ titleValue, setTitleValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const titleRef = useRef();

  // Initialize title value
  useEffect(() => {
    setTitleValue(value);
  }, [setTitleValue, value]);

  const endEdit = () => {
    if (isEditing) {
      document.getSelection().removeAllRanges();
      if (titleValue !== value) {
        saveNewValue(titleValue);
      }
      setIsEditing(false);
    }
  };

  return {
    titleRef,
    titleValue,
    readOnly: !isEditing,
    inputClassName: isEditing ? 'editing' : '',
    changeTitleValue: (newValue) => setTitleValue(newValue),
    beginTitleEdit: () => {
      if (!isEditing) {
        setIsEditing(true);
        titleRef.current.focus();
        titleRef.current.setSelectionRange(
          titleRef.current.value.length,
          titleRef.current.value.length,
        );
      }
    },
    endTitleEdit: endEdit,
    handleTitleKeyPress: (event) => {
      if (isEditing) {
        if(event.key === 'Enter' || event.key === 'Tab') {
          endEdit();
        }
      }
    },
  };
};

export const useVersionControlHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.userData.userId || '');
  const status = useSelector(state => state.sessionManager.status || 'idle');
  const activeProject = useSelector(state => state.sessionManager.activeCampaignId || '');
  const projectData = useSelector(state => state.campaignData.present || {});
  const pastProjectData = useSelector(state => state.campaignData.past || {});
  const futureProjectData = useSelector(state => state.campaignData.future || {});
  const [ saveCompleted, setSaveCompleted ] = useState(false);

  let saveStatus = 'enabled';
  if (status === 'saving') {
    saveStatus = 'saving';
  } else if (!((status === 'idle') && userId && activeProject)) {
    saveStatus = 'disabled';
  // } else if (pending) {
  //   saveStatus = 'pending';  // (there are multiple changes since last save; currently not implemented)
  } else if (saveCompleted) {
    saveStatus = 'completed';
  }

  return {
    undo: () => store.dispatch(ActionCreators.undo()),
    disableUndo: pastProjectData.length === 0,
    redo: () => store.dispatch(ActionCreators.redo()),
    disableRedo: futureProjectData.length === 0,
    save: () => {
      console.log("[Status] saving. Triggered by manual save.");
      dispatch(actions.setStatus('saving'));
      dispatch(fireactions.saveCampaignData(activeProject, projectData,
        () => {
          console.log("[Status] idle. Triggered by manual save completion.");
          dispatch(actions.setStatus('idle'))
        }
      ));
      setSaveCompleted(true);
    },
    saveStatus,
  };
};

export const useProjectHooks = () => {
  const dispatch = useDispatch();
  const activeProject = useSelector(state => state.sessionManager.activeCampaignId || '');
  const projects = useSelector(state => state.sessionManager.campaignList || []);
  const projectData = useSelector(state => state.campaignData.present || {});
  const [ showProjectDropdown, setShowProjectDropdown ] = useState(false);
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
    projects: sortedProjects,
    newProject: () => {
      if (activeProject) {
        console.log("[Status] saving. Triggered by new project.");
        dispatch(actions.setStatus('saving'));
        dispatch(fireactions.saveCampaignData(
          activeProject,
          projectData,
          () => {
            dispatch(fireactions.createProject());
            console.log("[Status] idle. Triggered by new project save completion.");
            dispatch(actions.setStatus('idle'));
          },
        ));
      } else {
        dispatch(fireactions.createProject());
      }
    },
  };
};

export const useProjectItemHooks = ({ closeProjectDropdown, id, name }) => {
  const dispatch = useDispatch();
  const activeProject = useSelector(state => state.sessionManager.activeCampaignId || '');
  const projectData = useSelector(state => state.campaignData.present || {});
  const [ confirmDelete, setConfirmDelete ] = useState(false);
  const deleteBtnRef = useRef();

  const isActiveProject = id === activeProject;

  useOutsideClick([deleteBtnRef], confirmDelete, setConfirmDelete, false);

  return {
    deleteBtnRef,
    isActiveProject,
    switchProject: () => {
      if (activeProject) {
        console.log("[Status] saving. Triggered by switching project.");
        dispatch(actions.setStatus('saving'));
        dispatch(fireactions.saveCampaignData(
          activeProject,
          projectData,
          () => {
            dispatch(fireactions.switchProject({ projectId: id }));
            console.log("[Status] idle. Triggered by switching project save completion.");
            dispatch(actions.setStatus('idle'));
          },
        ));
      } else {
        dispatch(fireactions.switchProject({ projectId: id }));
      }
      closeProjectDropdown();
    },
    copyProject: (event) => {
      event.stopPropagation();
      if (isActiveProject) {
        console.log("[Status] saving. Triggered by copying project.");
        dispatch(actions.setStatus('saving'));
        dispatch(fireactions.saveCampaignData(
          activeProject,
          projectData,
          () => {
            dispatch(fireactions.copyProject({ projectId: id }));
            console.log("[Status] idle. Triggered by copying project save completion.");
            dispatch(actions.setStatus('idle'));
          },
        ));
      } else {
        dispatch(fireactions.copyProject({ projectId: id }));
      }
    },
    confirmDeleteProject: (event) => {
      event.stopPropagation();
      dispatch(actions.setPopup({
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
  const email = useSelector(state => state.userData.email || '');
  const projectData = useSelector (state => state.campaignData.present || {});
  const activeProject = useSelector(state => state.sessionManager.activeCampaignId || '');
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
        console.log("[Status] saving. Triggered by manual log out.");
        dispatch(actions.setStatus('saving'));
        dispatch(fireactions.saveCampaignData(
          activeProject,
          projectData,
          () => {
            console.log("[Status] idle. Triggered by sign out completion.");
            dispatch(actions.setStatus('idle'));
            dispatch(fireactions.emailSignOut());
          }
        ));
      } else {
        dispatch(fireactions.emailSignOut());
      }
    },
  };
};

export const useDisplayNameHooks = () => {
  const dispatch = useDispatch();
  const username = useSelector(state => state.userData.displayName || '');
  const [ showDisplayNameInput, setShowDisplayInput ] = useState(false);
  const [ displayNameInput, setDisplayNameInput ] = useState('');
  const inputRef = useRef();

  const endDisplayNameInputEdit = () => {
    document.getSelection().removeAllRanges();
    if (displayNameInput !== username && displayNameInput !== '') {
      dispatch(actions.updUserDisplayname(displayNameInput));
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
  const userId = useSelector(state => state.userData.userId || '');
  const introProjectEdit = useSelector(state => state.sessionManager.introCampaignEdit || false);
  const projectData = useSelector (state => state.campaignData.present || {});
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
      setEmailError(false);
      setPasswordError(false);
      setAuthError(false);
      setForgotPasswordScreen(null);
    },
  );

  const signInViaEmail = (event) => {
    event.preventDefault();
    setEmailError('');
    setPasswordError('');
    setAuthError('');
    if (introProjectEdit) {
      let save = window.confirm("Would you like to save your work as a new project?");
      if (save) {
        dispatch(fireactions.emailSignIn({
          email,
          password,
          callback: () => {
            dispatch(fireactions.saveIntroProjectData({ projectData }));
            setAuthError('');
          },
          errorCallback: (errorCode) => setAuthError(convertToMsg({ errorCode })),
        }));
      } else {
        dispatch(fireactions.emailSignIn({
          email,
          password,
          callback: () => setAuthError(''),
          errorCallback: (errorCode) => setAuthError(convertToMsg({ errorCode })),
        }));
      }
      dispatch(actions.setIntroCampaignEdit(false));
    } else {
      dispatch(fireactions.emailSignIn({
        email,
        password,
        callback: () => setAuthError(''),
        errorCallback: (errorCode) => setAuthError(convertToMsg({ errorCode })),
      }));
    }
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
      dispatch(fireactions.sendPasswordResetToEmail({
        email,
        callback: () => setForgotPasswordScreen('success'),
        errorCallback: () => setForgotPasswordScreen('failure'),
      }));
    },

    signInViaEmail,
    signInViaGoogle: (event) => {
      event.preventDefault();
      dispatch(fireactions.googleSignIn());
    },
    authError,
    clearAuthError: () => setAuthError(''),
  };
};

export const useSignUpHooks = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.userData.userId || '');
  const [ showSignUpDropdown, setShowSignUpDropdown ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ emailError, setEmailError ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordError, setPasswordError ] = useState('');
  const [ authError, setAuthError ] = useState('');
  const signUpBtnRef = useRef();
  const signUpDropdownRef = useRef();

  // Initialize sign up form
  useEffect(() => {
    if (!!userId) {
      setShowSignUpDropdown(false);
      setEmail('');
      setPassword("");
    }
  }, [userId]);

  useOutsideClick(
    [signUpBtnRef, signUpDropdownRef],
    showSignUpDropdown,
    () => setShowSignUpDropdown(false),
  );

  const signUpViaEmail = (event) => {
    event.preventDefault();
    setEmailError('');
    setPasswordError('');
    setAuthError('');
    dispatch(fireactions.emailSignUp({
      email,
      password,
      callback: () => setAuthError(''),
      errorCallback: (errorCode) => setAuthError(convertToMsg({ errorCode })),
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
    signUpViaGoogle: (event) => {
      event.preventDefault();
      dispatch(fireactions.googleSignIn());
    },
    authError,
    clearAuthError: () => setAuthError(''),
  };
};
