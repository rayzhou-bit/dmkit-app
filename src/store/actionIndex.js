// SERVERCALLS
export {
  getUserId, getUserEmail,

  emailSignIn, emailSignOut, emailSignUp,
  receiveSignInData,

  loadInitCampaign, unloadCampaign,
  createCampaign, destroyCampaign, switchCampaign, 

  sendCampaignData, receiveCampaignData,
  autoSaveCampaignData,
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

  unsetCampaignEdit,
} from './action/campaign';

// CARD
export {
  initCardColl, loadCardColl, unloadCardColl,

  linkCardToView, unlinkCardFromView,
  createCard, destroyCard, copyCard,

  updCardPos, updCardSize,
  updCardColor, updCardType,
  updCardTitle, updCardText,

  updActiveCardId,
  clearCardDelete, clearCardEdit,
} from './action/card';

// VIEW
export {
  initViewColl, loadViewColl, unloadViewColl,

  createView, destroyView, copyView,

  updViewColor,
  updViewTitle,

  shiftViewInViewOrder,
  updActiveViewId,
  clearViewDelete, clearViewEdit,
} from './action/view'