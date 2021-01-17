// SERVERCALLS
export {
  getUserId, getUserEmail,

  emailSignIn, emailSignOut, emailSignUp,

  switchCampaign, createCampaign,
  loadInitCampaign, unloadCampaign,

  fetchUserDataFromServer,
  fetchCampaignDataFromServer,
} from './action/serverCalls';

// CAMPAIGN
export {
  initCampaignColl, loadCampaignColl, unloadCampaignColl,
  setCampaignEdit, resetCampaignEdit,

  addCampaign,

  updCampaignTitle,

  updActiveCampaign,
} from './action/campaign';

// CARD
export {
  initCardColl, loadCardColl, unloadCardColl,
  unsetCardEdit,

  addCard, removeCard,
  connectCardToView, disconnectCardFromView,
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
  initViewColl, loadViewColl, unloadViewColl,
  unsetViewEdit,

  addView, removeView,

  createView, destroyView,

  updViewTitle,

  shiftViewInViewOrder,

  updActiveViewId,

  dequeueViewCreate, clearViewCreate,
  clearViewDelete,
} from './action/view'