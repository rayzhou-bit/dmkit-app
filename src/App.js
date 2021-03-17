import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './App.scss';
import * as actions from './store/actionIndex';
import * as fireactions from './store/firestoreIndex';
import { auth } from './store/firestoreAPI/firebase';
import UserMenu from './components/UserMenu/UserMenu';
import ToolMenu from './components/ToolMenu/ToolMenu';
import Library from './components/Library/Library';
import ViewSelect from './components/ViewSelect/ViewSelect';
import ViewScreen from './components/ViewScreen/ViewScreen';

const App = props => {
  const dispatch = useDispatch();

  // STATES
  const campaignEdit = useSelector(state => state.sessionManager.campaignEdit);
  const campaignData = useSelector(state => state.campaignData);

  // REFS
  const toolMenuRef = useRef("toolMenu");

  // Disable scrolling
  document.body.scroll = "no";
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;
  
  // Auth listener
  useEffect(() => {
    const authListener = auth.onAuthStateChanged(user => {
      // TODO: loading start
      if (user && user.uid) {
        // Signed in
        console.log("[authListener] signed in user:", user.uid);
        // prompt user to save intro campaign
        if (campaignEdit) {
          let save = null;
          save = window.confirm("Would you like to save your work as a new campaign?");
          if (save) {
            dispatch(fireactions.saveIntroCampaignData(campaignData,
              () => {
                // where is unload?
                dispatch(fireactions.fetchActiveCampaignId());
                dispatch(fireactions.fetchCampaignList());
              }
            ));
          } else {
            dispatch(fireactions.fetchActiveCampaignId());
            dispatch(fireactions.fetchCampaignList());
          }
        } else {
          dispatch(fireactions.fetchActiveCampaignId());
          dispatch(fireactions.fetchCampaignList());
        }
        // TODO: loading end
      } else {
        // Signed out
        console.log("[authListener] signed out");
        dispatch(actions.unloadUser());
        dispatch(actions.resetSessionManager());
        dispatch(actions.loadIntroCampaign());
        // TODO: loading end
      }
    });
    return () => authListener();
  }, [dispatch]);

  return (
    <div className="layout">
      <UserMenu />
      <ToolMenu toolMenuRef={toolMenuRef} />
      <Library />
      <ViewSelect />
      <ViewScreen toolMenuRef={toolMenuRef} />

      {/* <Backdrop show={loading} />
      <div></div> */}
    </div>
  );
};

export default App;
