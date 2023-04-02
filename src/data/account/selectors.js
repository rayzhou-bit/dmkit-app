import { createSelector } from 'reselect';
import * as module from './selectors';

export const accountState = (state) => state.account;
const mkSimpleSelector = (cb) => createSelector([module.accountState], cb);
export const simpleSelectors = {
  id: mkSimpleSelector(account => account.id),
  displayName: mkSimpleSelector(account => account.displayName),
  email: mkSimpleSelector(account => account.email),
  emailVerified: mkSimpleSelector(account => account.emailVerified),
  emailVerificationRequired: mkSimpleSelector(account => account.emailVerificationRequired),
  campaignList: mkSimpleSelector(account => account.campaignList),
  activeCampaign: mkSimpleSelector(account => account.activeCampaignId),
  campaignEdit: mkSimpleSelector(account => account.campaignEdit),
  status: mkSimpleSelector(account => account.status),
  errorPasswordReset: mkSimpleSelector(account => account.errorPasswordReset),
  errorEmailSignIn: mkSimpleSelector(account => account.errorEmailSignIn),
  errorEmailSignUp: mkSimpleSelector(account => account.errorEmailSignUp),
  errorGoogleSignIn: mkSimpleSelector(account => account.errorGoogleSignIn),
  errorFacebookSignIn: mkSimpleSelector(account => account.errorFacebookSignIn),
};

export const errors = createSelector(
  [
    module.simpleSelectors.errorPasswordReset,
    module.simpleSelectors.errorEmailSignIn,
    module.simpleSelectors.errorEmailSignUp,
    module.simpleSelectors.errorGoogleSignIn,
    module.simpleSelectors.errorFacebookSignIn,
  ],
  (
    errorPasswordReset,
    errorEmailSignIn,
    errorEmailSignUp,
    errorGoogleSignIn,
    errorFacebookSignIn,
  ) => ({
    errorPasswordReset,
    errorEmailSignIn,
    errorEmailSignUp,
    errorGoogleSignIn,
    errorFacebookSignIn,
  }),
);

export default {
  ...simpleSelectors,
  errors,
};