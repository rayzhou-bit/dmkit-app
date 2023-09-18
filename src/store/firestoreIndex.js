/* TODO: redux refactor
    Files under /data will be the future store for dmkit.
    Get these files to work with the app.
    Files under /store to be removed.
*/

// USER AUTH API
export {
  updateDisplayName,

  emailSignIn, emailSignOut,
  googleSignIn, facebookSignIn,

  emailSignUp, sendVerificationToEmail, sendPasswordResetToEmail,
} from './firestoreAPI/authTransactions';

export {
  fetchActiveCampaignId, fetchCampaignList,
  fetchCampaignData, saveCampaignData, saveIntroCampaignData,
  switchCampaign,
  createCampaign, copyCampaign, destroyCampaign,
} from './firestoreAPI/storeTransactions';
