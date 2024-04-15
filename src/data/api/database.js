// TODO replace campaign terminology with project terminology

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
} from '@firebase/firestore';

import { db } from './firebase';
import { getUserId } from './auth';

import { actions } from '../redux';
import { NETWORK_STATUS, DEFAULT_PROJECT } from '../redux/session/constants';
import { BLANK_PROJECT } from '../redux/project/constants';

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

export const fetchActiveProjectId = () => dispatch => {
  getDoc(userDoc())
    .then(userSnapshot => {
      console.log('[fetchActiveProjectId] success', userSnapshot.data());
      const activeProjectId = userSnapshot.data().activeCampaignId ?? null;
      if (activeProjectId) {
        dispatch(actions.session.setActiveProject({ id: activeProjectId }));
      }
    })
    .catch(error => console.log('[fetchActiveProjectId] error', error));
};

export const fetchProjects = () => dispatch => {
  getDocs(projectCollection())
    .then(projectsSnapshot => {
      console.log('[fetchProjects] success', projectsSnapshot.docs);
      let projects = {};
      projectsSnapshot.forEach(project => {
        projects = { ...projects, [project.id]: project.data().title ?? '' };
      });
      dispatch(actions.session.loadProjects({ projects }));
    })
    .catch(error => console.log('[fetchProjects] error', error));
};

const fetchCards = (project) => dispatch => {
  getDocs(cardCollection(project))
    .then(cardsSnapshot => {
      console.log('[fetchCards] success', cardsSnapshot.docs);
      let cards = {};
      cardsSnapshot.forEach(cardSnapshot => {
        cards = { ...cards, [cardSnapshot.id]: cardSnapshot.data() };
      });
      dispatch(actions.project.loadCards({ cards }));
    })
    .catch(error => console.log('[fetchCards] error', error));
};

const fetchTabs = (project) => dispatch => {
  getDocs(tabCollection(project))
    .then(tabsSnapshot => {
      console.log('[fetchTabs] success', tabsSnapshot.docs);
      let tabs = {};
      tabsSnapshot.forEach(tabSnapshot => {
        tabs = { ...tabs, [tabSnapshot.id]: tabSnapshot.data() };
      });
      dispatch(actions.project.loadTabs({ tabs }));
    })
    .catch(error => console.log('[fetchTabs] error', error));
};

export const fetchProjectData = (id, callback) => dispatch => {
  status.loading('fetch project');
  getDoc(projectDoc(id))
    .then(projectSnapshot => {
      console.log('[fetchProjectData] success', projectSnapshot.data());
      dispatch(actions.project.loadProject({ project: projectSnapshot.data() }));
      dispatch(fetchCards(id));
      dispatch(fetchTabs(id));
      status.idle('finished fetching project')
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[fetchProjectData] error', error));
};

export const firstTimeSetup = () => dispatch => {
  setDoc(userDoc(), { activeCampaignId: null })
    .then(response => console.log('[firstTimeSetup] success', response))
    .catch(error => console.log('[firstTimeSetup] error', error));
};

const saveActiveProjectId = (id, callback) => dispatch => {
  updateDoc(userDoc(), { activeCampaignId: id })
    .then(response => {
      console.log('[saveActiveProjectId] success', response);
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[saveActiveProjectId] error', error));
};

export const switchProject = (projectId) => dispatch => {
  saveActiveProjectId(projectId, () => {
    dispatch(actions.session.setActiveProject({ id }));
  });
};

const saveExistingProject = (id, data, callback) => dispatch => {
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
      console.log('[saveExistingProject] success', response);
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[saveExistingProject] error', error));
};

const saveNewProject = (data, callback) => dispatch => {
  addDoc(projectCollection(), { createdOn: Date.now(), lastSavedOn: Date.now() })
    .then(response => {
      console.log('[saveNewProject] success', response);
      dispatch(saveExistingProject(response.id, data, callback));
    })
    .catch(error => console.log('[saveNewProject] error', error));
};

export const save = (projectId, projectData, callback) => dispatch => {
  status.saving('saving project');
  if (DEFAULT_PROJECT[projectId]) {
    dispatch(saveNewProject(projectData, () => {
      if (callback) {
        dispatch(actions.session.setIsProjectEdited(false));
        callback();
      }
      status.idle('finished saving new project');
    }));
  } else {
    dispatch(saveExistingProject(projectId, projectData, () => {
      if (callback) {
        dispatch(actions.session.setIsProjectEdited(false));
        callback();
      }
      status.idle('finished saving existing project');
    }));
  }
};

export const createAndSwitchToEmptyProject = (callback) => dispatch => {
  addDoc(projectCollection(), { ...BLANK_PROJECT })
    .then(response => {
      console.log('[createAndSwitchToEmptyProject] success', response);
      dispatch(actions.session.addProject({
        id: response.id,
        title: BLANK_PROJECT.title,
      }));
      dispatch(saveActiveProjectId(response.id, callback));
    })
    .catch(error => console.log('[createAndSwitchToEmptyProject] error', error));
};

export const copyProject = (id, callback) => dispatch => {
  let projectData = {};
  getDoc(projectDoc(id))
    .then(projectSnapshot => {
      projectData = projectSnapshot.data();
      projectData = {
        ...projectData,
        title: projectData + ' (copy)',
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
            .catch(error => console.log('[copyProject] error getting tabs', error));
        })
        .catch(error => console.log('[copyProject] error getting cards', error));
      })
    .catch(error => console.log('[copyProject] error', error));
};

export const destroyProject = (id, callback) => dispatch => {
  deleteDoc(projectDoc(id))
    .then(response => {
      console.log('[destroyProject] success', response);
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[destroyProject] error', error));
};
