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
        <ul className='user-options-ul'>
          <li key='username' className='username'>
            <span>{username}</span>
          </li>
          <li key='email' className='email'>
            <span>{email}</span>
          </li>
          <li
            key='change-name-button'
            className={'change-name-button' + (!showDisplayNameInput ? ' hover' : '')}
            onClick={openDisplayNameInput}
            ref={inputRef}
          >
            <span>Change display name</span>
          </li>
          { 
            showDisplayNameInput 
            ? <li key='change-name-input' className='change-name-input'>
                <input
                  onChange={event => changeDisplayNameInput(event.target.value, event)}
                  onKeyDown={event => handleDisplayNameInputKeyPress(event)}
                  placeholder={username}
                  value={displayNameInput}
                />
              </li>
            : null
          }
          <li key='change-name-description' className='change-name-description'>
            {
              showDisplayNameInput
              ? <span>Hit enter to save</span>
              : null
            }
          </li>
          <li key='logout' className='log-out' onClick={event => logOut(event)}>
            <span>Log out</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserOptions;
