// SERVERCALLS
export {
  getUserId, getUserEmail,

  emailSignIn, emailSignOut, emailSignUp,
  receiveSignInData,

  loadInitCampaign, unloadCampaign,
  createCampaign, destroyCampaign, switchCampaign, 

  sendCampaignData, receiveCampaignData,
} from './action/serverCalls';

// USER
export {
  initDataManager,
  loadUser, unloadUser,
} from './action/user';

// CAMPAIGN
export {
  initCampaignColl, loadCampaignColl, unloadCampaignColl,

  addCampaign, removeCampaign,

  updCampaignTitle,

  updActiveCampaignId,
} from './action/campaign';

// CARD
export {
  initCardColl, loadCardColl, unloadCardColl,

  addCard, removeCard,
  connectCardToView, disconnectCardFromView,
  createCard, destroyCard, copyCard,

  updCardPos, updCardSize,
  updCardColor, updCardColorForAllViews,
  updCardType,

  updCardTitle, updCardText,

  updActiveCardId,
  clearCardDelete,
} from './action/card';

// VIEW
export {
  initViewColl, loadViewColl, unloadViewColl,

  addView, removeView,
  createView, destroyView, copyView,

  updViewColor,

  updViewTitle,

  shiftViewInViewOrder,
  updActiveViewId,
  clearViewDelete,
} from './action/view'