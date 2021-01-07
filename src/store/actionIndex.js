// SERVERCALLS
export {
  authCheck,
  emailSignIn, emailSignOut, emailSignUp,

  fetchUserDataFromServer, saveUserDataToServer,

  fetchCampaignDataFromServer, saveCampaignDataToServer,
  createCampaignOnServer,
} from './action/serverCalls';

// USER
export {
  updUser,
} from './action/user';

// CAMPAIGN
export {
  loadCampaignColl, unloadCampaignColl,
  setCampaignEdit, resetCampaignEdit,

  addCampaign,

  updCampaignTitle,

  updActiveCampaign,
} from './action/campaign';

// CARD
export {
  loadCardColl, unloadCardColl,
  resetCardEdit,

  addCardToStore, deleteCardFromStore,
  connectCardToView, removeCardFromView,
  setCardCreate, setCardDelete,
  setCardCopy,

  updCardPos, updCardSize,
  updCardColor, updCardColorForAllViews,
  updCardType,
  updCardTitle, updCardText,

  updActiveCard,

  dequeueCardCreate,
  clearCardDelete,
} from './action/card';

// VIEW
export {
  loadViewOrder, unloadViewColl,
  resetViewEdit,

  addViewToStore, deleteViewFromStore,
  
  saveViewsToServer,

  setViewCreate, setViewDelete,

  updViewTitle,

  updViewOrder,
  updActiveView,
  dequeueViewCreate,
  clearViewDelete,
} from './action/view'