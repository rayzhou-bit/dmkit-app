import {
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

import { db, isFirebaseConfigured, FIREBASE_NOT_CONFIGURED_MESSAGE } from './firebase';
import { getUserId } from './auth';

import { actions } from '../redux';
import { NETWORK_STATUS } from '../../constants/states';
import { DEFAULT_PROJECT } from '../redux/session/constants';
import { BLANK_PROJECT } from '../redux/project/constants';

// TODO replace campaign terminology with project terminology

const userDoc = () => doc(db, 'users', getUserId());
const projectDoc = (project) => doc(db, 'users', getUserId(), 'campaigns', project);
const cardDoc = (project, card) => doc(db, 'users', getUserId(), 'campaigns', project, 'cards', card);
const tabDoc = (project, tab) => doc(db, 'users', getUserId(), 'campaigns', project, 'views', tab);
const projectCollection = () => collection(db, 'users', getUserId(), 'campaigns');
const cardCollection = (project) => collection(db, 'users', getUserId(), 'campaigns', project, 'cards');
const tabCollection = (project) => collection(db, 'users', getUserId(), 'campaigns', project, 'views');

const status = {
  idle: (logging) => dispatch => dispatch(actions.session.setStatus({ status: NETWORK_STATUS.idle, logging })),
  loading: (logging) => dispatch => dispatch(actions.session.setStatus({ status: NETWORK_STATUS.loading, logging })),
  saving: (logging) => dispatch => dispatch(actions.session.setStatus({ status: NETWORK_STATUS.saving, logging })),
};

// Records a failed request in session.error so a failure isn't silently
// swallowed by a console.log no one is watching. Callers that put `status`
// into `loading`/`saving` beforehand are responsible for resetting it back
// to `idle` themselves (see reportError's callers below) - this alone does
// not touch status.
const reportError = (dispatch, source, error) => {
  console.log(`[${source}] error`, error);
  dispatch(actions.session.setError({ source, message: error?.message ?? String(error) }));
};

const requireFirebase = (dispatch, source) => {
  if (isFirebaseConfigured) return true;
  reportError(dispatch, source, new Error(FIREBASE_NOT_CONFIGURED_MESSAGE));
  return false;
};

export const fetchActiveProjectId = () => dispatch => {
  if (!requireFirebase(dispatch, 'fetchActiveProjectId')) return;
  getDoc(userDoc())
    .then(userSnapshot => {
      console.log('[fetchActiveProjectId] success:', userSnapshot.data());
      const activeProjectId = userSnapshot.data().activeCampaignId ?? null;
      if (activeProjectId) {
        dispatch(actions.session.setActiveProject({ id: activeProjectId }));
      }
    })
    .catch(error => reportError(dispatch, 'fetchActiveProjectId', error));
};

export const fetchProjects = () => dispatch => {
  if (!requireFirebase(dispatch, 'fetchProjects')) return;
  getDocs(projectCollection())
    .then(projectsSnapshot => {
      console.log(`[fetchProjects] success: ${projectsSnapshot.docs?.length} project titles fetched`);
      let projects = {};
      projectsSnapshot.forEach(project => {
        projects = { ...projects, [project.id]: project.data().title ?? '' };
      });
      dispatch(actions.session.loadProjects({ projects }));
    })
    .catch(error => reportError(dispatch, 'fetchProjects', error));
};

const fetchCards = (project) => dispatch => {
  if (!requireFirebase(dispatch, 'fetchCards')) return;
  getDocs(cardCollection(project))
    .then(cardsSnapshot => {
      console.log(`[fetchCards] success: ${cardsSnapshot.docs?.length} cards fetched`);
      let cards = {};
      cardsSnapshot.forEach(cardSnapshot => {
        cards = { ...cards, [cardSnapshot.id]: cardSnapshot.data() };
      });
      dispatch(actions.project.loadCards({ cards }));
    })
    .catch(error => reportError(dispatch, 'fetchCards', error));
};

const fetchTabs = (project) => dispatch => {
  if (!requireFirebase(dispatch, 'fetchTabs')) return;
  getDocs(tabCollection(project))
    .then(tabsSnapshot => {
      console.log(`[fetchTabs] success: ${tabsSnapshot.docs?.length} tabs fetched`);
      let tabs = {};
      tabsSnapshot.forEach(tabSnapshot => {
        tabs = { ...tabs, [tabSnapshot.id]: tabSnapshot.data() };
      });
      dispatch(actions.project.loadTabs({ tabs }));
    })
    .catch(error => reportError(dispatch, 'fetchTabs', error));
};

export const fetchProjectData = (id, callback) => dispatch => {
  if (!requireFirebase(dispatch, 'fetchProjectData')) return;
  dispatch(status.loading('fetch project'));
  getDoc(projectDoc(id))
    .then(projectSnapshot => {
      console.log(`[fetchProjectData] success: project "${projectSnapshot.data()?.title}" fetched`);
      dispatch(actions.project.loadProject({ project: projectSnapshot.data() }));
      dispatch(fetchCards(id));
      dispatch(fetchTabs(id));
      dispatch(status.idle('finished fetching project'));
      if (callback) {
        callback();
      }
    })
    .catch(error => {
      reportError(dispatch, 'fetchProjectData', error);
      dispatch(status.idle('fetchProjectData failed'));
    });
};

export const firstTimeSetup = () => dispatch => {
  if (!requireFirebase(dispatch, 'firstTimeSetup')) return;
  setDoc(userDoc(), { activeCampaignId: null })
    .then(response => console.log('[firstTimeSetup] success', response))
    .catch(error => reportError(dispatch, 'firstTimeSetup', error));
};

const saveActiveProjectId = (id, callback) => dispatch => {
  if (!requireFirebase(dispatch, 'saveActiveProjectId')) return;
  setDoc(userDoc(), { activeCampaignId: id })
    .then(response => {
      console.log('[saveActiveProjectId] success');
      if (callback) {
        callback();
      }
    })
    .catch(error => reportError(dispatch, 'saveActiveProjectId', error));
};

export const switchProject = (projectId) => dispatch => {
  if (!requireFirebase(dispatch, 'switchProject')) return;
  dispatch(saveActiveProjectId(projectId, () => {
    dispatch(actions.session.setActiveProject({ id: projectId }));
  }));
};

const saveExistingProject = (id, data, callback) => dispatch => {
  if (!requireFirebase(dispatch, 'saveExistingProject')) return;
  const batch = writeBatch(db);
  let projectBatch = { ...data, lastSavedOn: Date.now() };
  delete projectBatch.cards;
  delete projectBatch.views;
  batch.set(projectDoc(id), projectBatch);
  for (let cardId in data.cards) {
    batch.set(cardDoc(id, cardId), data.cards[cardId]);
  }
  for (let tabId in data.views) {
    batch.set(tabDoc(id, tabId), data.views[tabId]);
  }
  batch.commit()
    .then(response => {
      console.log('[saveExistingProject] success');
      if (callback) {
        callback();
      }
    })
    .catch(error => {
      // `save()` only resets status back to idle inside this callback's
      // success path, so a failure here has to reset it itself or the app
      // stays stuck thinking a save is in progress.
      reportError(dispatch, 'saveExistingProject', error);
      dispatch(status.idle('saveExistingProject failed'));
    });
};

const saveNewProject = (data, callback) => dispatch => {
  if (!requireFirebase(dispatch, 'saveNewProject')) return;
  addDoc(projectCollection(), { createdOn: Date.now(), lastSavedOn: Date.now() })
    .then(response => {
      console.log('[saveNewProject] success', response);
      dispatch(saveExistingProject(response.id, data, callback));
    })
    .catch(error => {
      reportError(dispatch, 'saveNewProject', error);
      dispatch(status.idle('saveNewProject failed'));
    });
};

export const save = (projectId, projectData, callback) => dispatch => {
  if (!requireFirebase(dispatch, 'save')) return;
  dispatch(status.saving('saving project'));
  if (DEFAULT_PROJECT[projectId]) {
    dispatch(saveNewProject(projectData, () => {
      dispatch(actions.session.setIsProjectEdited(false));
      if (callback) {
        callback();
      }
      dispatch(status.idle('finished saving new project'));
    }));
  } else {
    dispatch(saveExistingProject(projectId, projectData, () => {
      dispatch(actions.session.setIsProjectEdited(false));
      if (callback) {
        callback();
      }
      dispatch(status.idle('finished saving existing project'));
    }));
  }
};

export const createAndSwitchToEmptyProject = (callback) => dispatch => {
  if (!requireFirebase(dispatch, 'createAndSwitchToEmptyProject')) return;
  addDoc(projectCollection(), { ...BLANK_PROJECT })
    .then(response => {
      console.log(`[createAndSwitchToEmptyProject] success: created project ${response?.id}`);
      dispatch(actions.session.addProject({
        id: response.id,
        title: BLANK_PROJECT.title,
      }));
      dispatch(saveActiveProjectId(response.id, () => {
        dispatch(actions.session.setActiveProject({ id: response.id }));
      }));
    })
    .catch(error => reportError(dispatch, 'createAndSwitchToEmptyProject', error));
};

export const copyProject = (id, callback) => dispatch => {
  if (!requireFirebase(dispatch, 'copyProject')) return;
  let projectData = {};
  getDoc(projectDoc(id))
    .then(projectSnapshot => {
      projectData = projectSnapshot.data();
      projectData = {
        ...projectData,
        title: projectData.title + ' (copy)',
        createdOn: Date.now(),
        lastSavedOn: Date.now(),
      };
      getDocs(cardCollection(id))
        .then(cardsSnapshot => {
          let cards = {};
          cardsSnapshot.forEach(cardSnapshot => {
            cards = { ...cards, [cardSnapshot.id]: cardSnapshot.data() };
          });
          projectData.cards = cards;
          getDocs(tabCollection(id))
            .then(tabsSnapshot => {
              let tabs = {};
              tabsSnapshot.forEach(tabSnapshot => {
                tabs = { ...tabs, [tabSnapshot.id]: tabSnapshot.data() };
              });
              projectData.views = tabs;
              dispatch(saveNewProject(projectData, callback));
            })
            .catch(error => reportError(dispatch, 'copyProject:tabs', error));
        })
        .catch(error => reportError(dispatch, 'copyProject:cards', error));
      })
    .catch(error => reportError(dispatch, 'copyProject', error));
};

export const destroyProject = (id, callback) => dispatch => {
  if (!requireFirebase(dispatch, 'destroyProject')) return;
  // Firestore doesn't cascade-delete subcollections - deleting just the
  // project doc would leave its cards/views behind forever, orphaned.
  Promise.all([getDocs(cardCollection(id)), getDocs(tabCollection(id))])
    .then(([cardsSnapshot, tabsSnapshot]) => {
      const batch = writeBatch(db);
      cardsSnapshot.forEach(doc => batch.delete(doc.ref));
      tabsSnapshot.forEach(doc => batch.delete(doc.ref));
      batch.delete(projectDoc(id));
      return batch.commit();
    })
    .then(response => {
      console.log('[destroyProject] success', response);
      if (callback) {
        callback();
      }
    })
    .catch(error => reportError(dispatch, 'destroyProject', error));
};
