// USER AUTH API
export {
  emailSignIn, emailSignOut,

  emailSignUp, sendEmailVerification,
  emailActionHandler,
} from './firebaseAPI/userAuth';

// USER DATA API
export {
  updateDisplayName,

  receiveSignInData,

  loadInitCampaign, unloadCampaign,
  createCampaign, destroyCampaign, switchCampaign, 

  sendCampaignData, receiveCampaignData,
  sendIntroCampaignData, autoSaveCampaignData,
} from './firebaseAPI/userData';

// USER
export {
  loadUser, unloadUser,
  updUserDisplayname,
  
  initDataManager,
  setErrorEmailSignIn, unsetErrorEmailSignIn,
  setErrorEmailSignUp, unsetErrorEmailSignUp,
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