// SERVERCALLS
export {
  getUserId, getUserEmail,

  emailSignIn, emailSignOut, emailSignUp,

  switchCampaign, createCampaign,
  loadInitCampaign, unloadCampaign,

  fetchUserDataFromServer,
  fetchCampaignDataFromServer,
} from './action/serverCalls';

// USER
export {
  loadUser, unloadUser,
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
  initCardColl,
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

  initCardManage,
  dequeueCardCreate, clearCardCreate,
  clearCardDelete,
} from './action/card';

// VIEW
export {
  initViewColl,
  loadViewColl, unloadViewColl,
  resetViewEdit,

  addViewToStore, deleteViewFromStore,

  setViewCreate, setViewDelete,

  updViewTitle,

  initViewManage,
  loadViewOrder, unloadViewOrder, updViewOrder,
  updActiveView,
  dequeueViewCreate, clearViewCreate,
  clearViewDelete,
} from './action/view'