import React, { useRef } from 'react';
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
  
  auth.onAuthStateChanged(resp => {
    // IMPLEMENT: loading start
    if (resp && resp.uid) {
      // Signed in
      console.log("[authObserver] signed in user:", resp.uid);
      dispatch(actions.receiveSignInData());
      // IMPLEMENT: prompt if user would like to save the campaign. maybe add to unloadCampaign
      // IMPLEMENT: loading end
    } else {
      // Signed out
      console.log("[authObserver] signed out:", resp);
      dispatch(actions.loadInitCampaign());
      // IMPLEMENT: loading end
    }
  });

  return (
    <div id="layout">
      <UserMenu id="userMenu" />
      <ToolMenu id="toolMenu" toolMenuRef={toolMenuRef} />
      <Library id="library" />
      <ViewSelect id="viewSelect" />
      <ViewScreen id="viewScreen" toolMenuRef={toolMenuRef} />
    </div>
  );
};

export default App;
