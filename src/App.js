import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import './App.scss';
import * as actions from './store/actionIndex';
import { auth } from './store/firebaseAPI/firebase';
import UserMenu from './components/UserMenu/UserMenu';
import ToolMenu from './components/ToolMenu/ToolMenu';
import Library from './components/Library/Library';
import ViewSelect from './components/ViewSelect/ViewSelect';
import ViewScreen from './components/ViewScreen/ViewScreen';

const App = props => {
  const dispatch = useDispatch();

  // IDS & REFS
  const toolMenuRef = useRef("toolMenu");

  // Disable scrolling
  document.body.scroll = "no";
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;
  
  // Auth listener
  useEffect(() => {
    const authListener = auth.onAuthStateChanged(resp => {
      console.log(resp)
      // TODO: loading start
      if (resp && resp.uid) {
        // Signed in
        console.log("[authListener] signed in user:", resp.uid);
        // const emailVerificationRequired = resp.providerData.map(provider => provider.providerId).includes('password');
        // if (emailVerificationRequired && resp.emailVerified) {
        //   dispatch(actions.receiveSignInData());
        // } else {
        //   //ask to verify... send email again?
        // }
        dispatch(actions.receiveSignInData());
        // TODO: loading end
      } else {
        // Signed out
        console.log("[authListener] signed out:", resp);
        dispatch(actions.loadInitCampaign());
        // TODO: loading end
      }
    });
    return authListener;
  }, []);

  // actions.emailActionHandler();

  return (
    <div id="layout">
      <UserMenu id="user-menu" />
      <ToolMenu id="tool-menu" toolMenuRef={toolMenuRef} />
      <Library id="library" />
      <ViewSelect id="view-select" />
      <ViewScreen id="view-screen" toolMenuRef={toolMenuRef} />
    </div>
  );
};

export default App;
