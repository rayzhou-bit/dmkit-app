/* TODO: redux refactor
    Files under /data will be the future store for dmkit.
    Get these files to work with the app.
    Files under /store to be removed.
*/

// USER
export {
  loadUser, unloadUser,
  updUserDisplayname,

  setErrorPasswordReset, unsetErrorPasswordReset,
  setErrorEmailSignIn, unsetErrorEmailSignIn,
  setErrorEmailSignUp, unsetErrorEmailSignUp,
  setErrorGoogleSignUp, unsetErrorGoogleSignUp,
  setErrorFacebookSignUp, unsetErrorFacebookSignUp,
} from './action/user';

// CAMPAIGN
export {
  resetSessionManager,
  loadCampaignList, addCampaignToList, removeCampaignFromList,
  updActiveCampaignId,

  resetPopup,
  setPopup,

  setStatus,
  setCampaignEdit, setIntroCampaignEdit,

  loadCampaignData, unloadCampaignData, loadIntroCampaign,
  updCampaignTitle,
} from './action/campaign';

// CARD
export {
  updActiveCardId,

  createCard, copyCard, destroyCard,
  linkCardToView, unlinkCardFromView,

  updCardPos, updCardSize,
  updCardColor, updCardColorForView,
  updCardForm,
  
  updCardTitle, updCardText,
} from './action/card';

// VIEW
export {
  updActiveViewId,
  shiftViewInViewOrder,

  createView, destroyView,

  lockActiveView, unlockActiveView,
  updActiveViewPos, updActiveViewScale,
  resetActiveView,

  updViewColor,
  updViewTitle,
} from './action/view'