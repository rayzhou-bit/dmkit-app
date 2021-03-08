// USER AUTH API
export {
  emailSignIn, emailSignOut,
  googleSignIn, facebookSignIn,

  emailSignUp, sendEmailVerification,
} from './firebaseAPI/userAuth';

// USER DATA API
export {
  updateDisplayName,

  receiveSignInData,

  createCampaign, destroyCampaign, switchCampaign, 

  loadCampaignData, unloadCampaignData, saveCampaignData, autoSaveCampaignData,
  initializeIntroCampaign, removeIntroCampaign, saveIntroCampaignData, 
} from './firebaseAPI/userData';

// USER
export {
  loadUser, unloadUser,
  updUserDisplayname,
  
  initDataManager,
  setReadyToLoadCampaign, unsetReadyToLoadCampaign,

  setErrorEmailSignIn, unsetErrorEmailSignIn,
  setErrorEmailSignUp, unsetErrorEmailSignUp,
  setErrorGoogleSignUp, unsetErrorGoogleSignUp,
  setErrorFacebookSignUp, unsetErrorFacebookSignUp,
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
  updCardColor, updCardColorForView,
  updCardType,
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