import React from 'react';

import { useSignUpHooks } from './hooks';

import './SignUp.scss';
import GoogleIcon from '../../assets/icons/google.png';
import CloseIcon from '../../assets/icons/close.svg';

const SignUp = () => {
  const {
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

    signUpViaEmail,
    signUpViaGoogle,
    authError,
    clearAuthError,
  } = useSignUpHooks();

  return (
    <div className='sign-up'>
      {
        authError
        ? <div className='error-banner'>
            <label className='error-msg'>{authError}</label>
            <button onClick={clearAuthError}>
              <img src={CloseIcon} />
            </button>
          </div>
        : null
      }
      <form onSubmit={event => signUpViaEmail(event)}>
        <label className='form-title'>DM Kit Sign Up</label>
        <label className='form-subtitle'>Create your free account</label>
        <div className='form-row'>
          <label className='input-label'>Email</label>
          <input
            className={emailClassName}
            name='email'
            // onAnimationEnd={clearAuthError}
            onChange={event => onChangeEmail(event)}
            onInvalid={event => emailOnInvalid(event)}
            placeholder='Email'
            required
            type='email'
            value={email}
          />
          <label className='error-msg'>{emailError}</label>
        </div>
        <div className='form-row'>
          <label className='input-label'>Password</label>
          <input
            className={passwordClassName}
            name='password'
            // onAnimationEnd={clearAuthError}
            onChange={event => onChangePassword(event)}
            onInvalid={event => passwordOnInvalid(event)}
            placeholder='Password'
            required
            type='password'
            value={password}
          />
          <label className='error-msg'>{passwordError}</label>
        </div>
        <button className='submit' type='submit'>
          Sign up
        </button>
      </form>
      <div className='google' onClick={event => signUpViaGoogle(event)}>
        <img src={GoogleIcon}/>
        <span>Sign up with Google</span>
      </div>
    </div>
  );
};

export default SignUp;
