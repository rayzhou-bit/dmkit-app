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
    if (resp && resp.uid) {
      // Signed in
      console.log("[authObserver] signed in user:", resp.uid);
      dispatch(actions.fetchUserDataFromServer());
      // IMPLEMENT: prompt if user would like to save the campaign. maybe add to unloadCampaign
      dispatch(actions.unloadCampaign());
      dispatch(actions.fetchCampaignDataFromServer());
    } else {
      // Signed out
      console.log("[authObserver] signed out");
      dispatch(actions.unloadUser());
      dispatch(actions.unloadCampaign());
      dispatch(actions.loadInitCampaign());  // This doubles as a campaign unload.
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
