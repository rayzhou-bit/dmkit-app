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

import { auth, db } from './firebase';
import { actions } from '../../data/redux';
import { NETWORK_STATUS } from '../redux/session/reducers';
import { BLANK_PROJECT } from '../redux/project/constants';

// User contains uid, email, emailVerified (check firebase for more)
const getUser = () => auth.currentUser ? auth.currentUser : null;
const getUserId = () => auth.currentUser ? auth.currentUser.uid : null;

const userDoc = () => doc(db, 'users', getUserId());
const projectDoc = (project) => doc(db, 'users', getUserId(), 'campaigns', project);
const cardDoc = (project, card) => doc(db, 'users', getUserId(), 'campaigns', project, 'cards', card);
const tabDoc = (project, tab) => doc(db, 'users', getUserId(), 'campaigns', project, 'views', tab);
const projectCollection = () => collection(db, 'users', getUserId(), 'campaigns');
const cardCollection = (project) => collection(db, 'users', getUserId(), 'campaigns', project, 'cards');
const tabCollection = (project) => collection(db, 'users', getUserId(), 'campaigns', project, 'views');

export const idleStatus = (trigger) => dispatch => dispatch(actions.session.setStatus({ status: NETWORK_STATUS.idle, trigger }));
export const loadingStatus = (trigger) => dispatch => dispatch(actions.session.setStatus({ status: NETWORK_STATUS.loading, trigger }));
export const savingStatus = (trigger) => dispatch => dispatch(actions.session.setStatus({ status: NETWORK_STATUS.saving, trigger }));

export const firstTimeSetup = () => dispatch => {
  const payload = { activeCampaignId: null };
  setDoc(userDoc(), payload)
    .then(response => {
      console.log('[firstTimeSetup] success', response);
      idleStatus('first time setup completion');
    })
    .catch(error => console.log('[firstTimeSetup] error', error));
};

//fetchActiveCampaignId
export const fetchActiveProjectId = () => dispatch => {
  getDoc(userDoc())
    .then(userSnapshot => {
      console.log('[fetchActiveProjectId] success', userSnapshot);
      const activeProjectId = userSnapshot.data().activeCampaignId;
      dispatch(actions.session.setActiveProject({ id: activeProjectId }));
    })
    .catch(error => console.log('[fetchActiveProjectId] error', error));
};

//fetchCampaignList
export const fetchProjects = () => dispatch => {
  getDocs(projectCollection())
    .then(projectsSnaptshot => {
      console.log('[fetchProjects] success', projectsSnaptshot);
      projectsSnaptshot.forEach(project => dispatch(actions.session.addProject({
        id: project.id,
        title: project.data().title ?? '',
      })));
    })
    .catch(error => console.log('[fetchProjects] error', error));
};

export const fetchCards = (project) => dispatch => {
  getDocs(cardCollection(project))
    .then(cardsSnapshot => {
      console.log('[fetchCards] success', cardsSnapshot);
      let cards = {};
      cardsSnapshot.forEach(cardSnapshot => {
        cards = { ...cards, [cardSnapshot.id]: cardSnapshot.data() };
      });
      dispatch(actions.project.loadCards({ cards }));
    })
    .catch(error => console.log('[fetchCards] error', error));
};

export const fetchTabs = (project) => dispatch => {
  getDocs(tabCollection(project))
    .then(tabsSnapshot => {
      console.log('[fetchTabs] success', tabsSnapshot);
      let tabs = {};
      tabsSnapshot.forEach(tabSnapshot => {
        tabs = { ...tabs, [tabSnapshot.id]: tabSnapshot.data() };
      });
      dispatch(actions.project.loadTabs({ tabs }));
    })
    .catch(error => console.log('[fetchTabs] error', error));
};

// fetchCampaignData
export const fetchProject = (id, callback) => dispatch => {
  getDoc(projectDoc(id))
    .then(projectSnapshot => {
      console.log('[fetchProject] success', projectSnapshot);
      dispatch(actions.project.loadProject({ project: projectSnapshot.data() }));
      fetchCards(id);
      fetchTabs(id);
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[fetchProject] error', error));
};

export const switchProject = (id, callback) => dispatch => {
  updateDoc(userDoc(), { activeCampaignId: id })
    .then(response => {
      console.log('[switchProject] success', response);
      dispatch(actions.session.setActiveProject({ id }));
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[switchProject] error', error));
};

// saveCampaignData
export const saveProject = (id, data, callback) => dispatch => {
  savingStatus('save');
  const batch = writeBatch(db);
  let projectBatch = { ...data, lastSaved: Date.now() };
  delete data.cards;
  delete data.views;
  batch.set(projectDoc(id), projectBatch);
  for (let cardId in data.cards) {
    batch.set(cardDoc(id, cardId), data.cards[cardId]);
  }
  for (let tabId in data.views) {
    batch.set(tabDoc(id, tabId), data.views[tabId]);
  }
  batch.commit()
    .then(response => {
      console.log('[saveProject] success', response);
      dispatch(actions.session.setProjectEdit(false));
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[saveProject] error', error));
};

// saveIntroProjectData
export const saveIntroProject = (data, callback) => dispatch => {
  savingStatus('save intro project');
  addDoc(projectCollection(), { createdOn: Date.now() })
    .then(response => {
      console.log('[saveIntroProject] success', response);
      saveProject(response.id, data, callback);
      switchProject(response.id);
    })
    .catch(error => console.log('[saveIntroProject] error', error));
};

export const createProject = (data, callback) => dispatch => {
  addDoc(projectCollection(), { createdOn: Date.now() })
    .then(response => {
      console.log('[createProject] success', response);
      saveProject(response.id, data, callback);
      switchProject(response.id);
      dispatch(actions.session.addProject({
        id: response.id,
        title: projectData.title,
      }));
      dispatch(actions.session.setActiveProject({ id: response.id }));
      if (callback) {
        callback();
      }
    })
    .catch(error => console.log('[createProject] error', error));
};

export const copyProject = (id, callback) => dispatch => {
  let projectData = {};
  getDoc(projectDoc(id))
    .then(projectSnapshot => {
      projectData = projectSnapshot.data();
      projectData.title += ' (copy)';
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
              createProject(projectData, callback);
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

//////////////


export const fetchActiveCampaignId = () => {
  const user = getUser();
  return dispatch => {
    if (user) {
      const userId = user.uid;
      getDoc(doc(db, "users", userId))
        .then(resp => {
          if (resp.exists) {
            dispatch(actions.session.setActiveProject({ id: resp.data().activeCampaignId }));
            if (!resp.data().activeCampaignId) {
              dispatch(actions.project.initialize());
              console.log("[Status] idle. Triggered by lack of server side activeCampaignId.");
              dispatch(actions.session.setStatus('idle'));
            };
            console.log("[fetchActiveCampaignId] success loading activeCampaignId", resp.data().activeCampaignId);
          } else dispatch(firstTimeSetup(userId));
        })
        .catch(err => {
          console.log("[fetchActiveCampaignId] error loading activeCampaignId:", err);
          // TODO insert case when error is "Failed to get document because the client is offline."
        });
    }
  };
};
