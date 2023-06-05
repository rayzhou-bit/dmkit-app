import { createSelector } from 'reselect';
import * as module from './selectors';

export const sessionState = (state) => state.session;
const mkSimpleSelector = (cb) => createSelector([module.sessionState], cb);
export const simpleSelectors = {
  completeState: mkSimpleSelector(problemData => problemData),
  campaignList: mkSimpleSelector(sessionData => sessionData.campaignList),
  activeCampaign: mkSimpleSelector(sessionData => sessionData.activeCampaign),
  activeCard: mkSimpleSelector(sessionData => sessionData.activeCard),
  popup: mkSimpleSelector(sessionData => sessionData.popup),
  status: mkSimpleSelector(sessionData => sessionData.status),
  isCampaignEdited: mkSimpleSelector(sessionData => sessionData.isCampaignEdited),
  passwordResetError: mkSimpleSelector(sessionData => sessionData.passwordResetError),
  emailSignInError: mkSimpleSelector(sessionData => sessionData.emailSignInError),
  emailSignUpError: mkSimpleSelector(sessionData => sessionData.emailSignUpError),
  googleSignInError: mkSimpleSelector(sessionData => sessionData.googleSignInError),
  facebookSignInError: mkSimpleSelector(sessionData => sessionData.facebookSignInError),
};

export default {
  ...simpleSelectors,
};
