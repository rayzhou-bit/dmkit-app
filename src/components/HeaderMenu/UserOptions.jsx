import React from 'react';

import { useUserOptionsHooks, useDisplayNameHooks } from './hooks';

import './index.scss';

const UserOptions = () => {
  const {
    btnRef,
    dropdownRef,
    showUserOptionsDropdown,
    openUserOptionsDropdown,
    closeUserOptionsDropdown,
    email,
    logOut,
  } = useUserOptionsHooks();

  const {
    inputRef,
    username,
    displayNameInput,
    showDisplayNameInput,
    openDisplayNameInput,
    changeDisplayNameInput,
    beginDisplayNameInputEdit,
    endDisplayNameInputEdit,
    handleDisplayNameInputKeyPress,
  } = useDisplayNameHooks();

  return (
    <div className='user-options'>
      <button
        className='header-menu-btn'
        onClick={showUserOptionsDropdown ? closeUserOptionsDropdown : openUserOptionsDropdown}
        ref={btnRef}
      >
        <span>{username}</span>
        <img />
      </button>
      <div
        className='dropdown'
        ref={dropdownRef}
        style={{ display: showUserOptionsDropdown ? 'block' : 'none' }}
      >
        <ul>
          <li key='username'>
            <div className='username-wrapper'>
              <span className='username'>{username}</span>
            </div>
          </li>
          <li key='email'>
            <div className='email-wrapper'>
              <span className='email'>{email}</span>
            </div>
          </li>
          <li className='break' key={'break-0'} />
          <li key='change-name'>
            <div>
              <button
                className='change-name'
                onClick={openDisplayNameInput}
                ref={inputRef}
              >
                Change display name
              </button>
              {
                showDisplayNameInput
                ? <input
                    onChange={event => changeDisplayNameInput(event.target.value)}
                    onKeyDown={event => handleDisplayNameInputKeyPress(event)}
                    value={displayNameInput}
                  />
                : null
              }
            </div>
          </li>
          <li className='break' key={'break-1'} />
          <li key='logout'>
            <div>
              <button
                className='log-out'
                onClick={event => logOut(event)}
              >
                Log out
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserOptions;
