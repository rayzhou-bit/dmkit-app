import React from 'react';

import { useSignInHooks } from './hooks';

import './index.scss';
import GoogleIcon from '../../assets/icons/google.png';

const SignIn = () => {
  const {
    signInBtnRef,
    signInDropdownRef,
    showSignInDropdown,
    openSignInDropdown,
    closeSignInDropdown,
    
    email,
    onChangeEmail,
    emailClassName,
    emailError,
    emailOnInvalid,
    
    password,
    onChangePassword,
    passwordClassName,
    passwordError,
    passwordOnInvalid,

    forgotPasswordScreen,
    openForgotPasswordScreen,
    sendPasswordReset,

    signInViaEmail,
    signInViaGoogle,
    authError,
    clearAuthError,
  } = useSignInHooks();

  const signInScreen = () => {
    return (
      <>
        <form onSubmit={event => signInViaEmail(event)}>
          <label className='form-title'>Sign in with Email</label>
          <input
            className={emailClassName}
            name='email'
            onChange={event => onChangeEmail(event)}
            onInvalid={event => emailOnInvalid(event)}
            placeholder='Email'
            required
            type='email'
            value={email}
          />
          <input
            className={passwordClassName}
            name='password'
            onChange={event => onChangePassword(event)}
            onInvalid={event => passwordOnInvalid(event)}
            placeholder='Password'
            required
            type='password'
            value={password}
          />
          <button className='forgot-password' onClick={(event) => openForgotPasswordScreen(event)}>
            Forgot your password?
          </button>
          <button className='submit' type='submit'>
            Sign in
          </button>
        </form>
        {
          !authError
          ? <div className='google' onClick={event => signInViaGoogle(event)}>
              <img src={GoogleIcon}/>
              <span>Sign in with Google</span>
            </div>
          : <div className='error-banner'>
              <label>{authError}</label>
            </div>
        }
      </>
    );
  };

  const forgotPasswordSubmitScreen = () => {
    return (
      <form onSubmit={event => sendPasswordReset(event)}>
        <label className='form-title'>Forgot Password?</label>
        <label className='form-subtitle'>
          Please enter the email you used when signing up to receive password reset instructions.
        </label>
        <input
          className='forgot-password-email-input'
          name='forgot-password-email-input'
          onChange={event => onChangeEmail(event)}
          placeholder='Email'
          required
          type='email'
          value={email}
        />
        <button className='submit' type='submit'>
          Send Password Reset
        </button>
      </form>
    );
  };

  const forgotPasswordSuccessScreen = () => {
    return (
      <form>
        <label className='form-title'>Success</label>
        <label className='form-subtitle'>
          Submission received. 
          If this email address was used to create an account,
          instructions to reset your password will be sent to you by email.
        </label>
      </form>
    );
  };

  const forgotPasswordFailureScreen = () => {
    return (
      <form>
        <label className='form-title'>Failure</label>
        <label className='form-subtitle'>
          Oops something went wrong.
        </label>
      </form>
    );
  };

  const element = () => {
    switch (forgotPasswordScreen) {
      case 'submit': return forgotPasswordSubmitScreen();
      case 'success': return forgotPasswordSuccessScreen();
      case 'failure': return forgotPasswordFailureScreen();
      default: return signInScreen();
    } 
  };

  return (
    <div className='sign-in'>
      <button
        className='sign-in-btn'
        onClick={showSignInDropdown ? closeSignInDropdown : openSignInDropdown}
        ref={signInBtnRef}
      >
        <span>Sign In</span>
      </button>
      <div
        className='header-dropdown'
        ref={signInDropdownRef}
        style={{ display: showSignInDropdown ? 'block' : 'none'}}
      >
        {element()}
      </div>
    </div>
  );
};

export default SignIn;
