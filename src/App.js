import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import './App.scss';
import * as actions from './store/actionIndex';
import { auth } from './shared/firebase';
import UserMenu from './containers/UserMenu/UserMenu';
import ToolMenu from './containers/ToolMenu/ToolMenu';
import Library from './containers/Library/Library';
import ViewSelect from './containers/ViewSelect/ViewSelect';
import ViewScreen from './containers/ViewScreen/ViewScreen';

const App = props => {
  const dispatch = useDispatch();

  // IDS & REFS
  const toolMenuRef = useRef("toolMenu");

  // Disable scrolling
  document.body.scroll = "no";
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;
  
  // Auth observer
  useEffect(() => {
    const authListener = auth.onAuthStateChanged(resp => {
      // IMPLEMENT: loading start
      if (resp && resp.uid) {
        // Signed in
        console.log("[authObserver] signed in user:", resp.uid);
        dispatch(actions.receiveSignInData());
        // IMPLEMENT: loading end
      } else {
        // Signed out
        console.log("[authObserver] signed out:", resp);
        dispatch(actions.loadInitCampaign());
        // IMPLEMENT: loading end
      }
    });
    return authListener;
  }, []);

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
