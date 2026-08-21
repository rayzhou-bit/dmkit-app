import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions } from '../../data/redux';

import './index.scss';

/*
  Surfaces session.error (set by reportError() across the Firebase API
  layer whenever a request fails) so a failed save/sign-in/etc. is visible
  instead of only ever landing in Redux and the console.
*/
export const ErrorBanner = () => {
  const dispatch = useDispatch();
  const error = useSelector(state => state.session.error);

  if (!error) {
    return null;
  }

  return (
    <div className='error-banner'>
      <span className='message'>{error.message}</span>
      <button
        className='dismiss'
        onClick={() => dispatch(actions.session.clearError())}
      >
        &times;
      </button>
    </div>
  );
};

export default ErrorBanner;
