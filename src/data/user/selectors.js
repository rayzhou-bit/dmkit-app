import { createSelector } from 'reselect';
import * as module from './selectors';

export const userState = (state) => state.user;
const mkSimpleSelector = (cb) => createSelector([module.userState], cb);
export const simpleSelectors = {
  completeState: mkSimpleSelector(userData => userData),
  userId: mkSimpleSelector(userData => userData.userId),
  displayName: mkSimpleSelector(userData => userData.displayName),
  email: mkSimpleSelector(userData => userData.email),
  emailVerified: mkSimpleSelector(userData => userData.emailVerified),
  emailVerificationRequired: mkSimpleSelector(userData => userData.emailVerificationRequired),
  providerId: mkSimpleSelector(userData => userData.providerId),
  providerData: mkSimpleSelector(userData => userData.providerData),
};

export default {
  ...simpleSelectors,
};
