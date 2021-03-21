import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './Loader.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import { auth } from '../../store/firestoreAPI/firebase';
import Backdrop from '../UI/Backdrop/Backdrop';
import Spinner from '../UI/Spinner/Spinner';

const Loader = props => {
  const dispatch = useDispatch();
  
  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const status = useSelector(state => state.sessionManager.status);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignEdit = useSelector(state => state.sessionManager.campaignEdit);
  const introCampaignEdit = useSelector(state => state.sessionManager.introCampaignEdit);
  const campaignData = useSelector(state => state.campaignData);
  
  // Auth listener
  useEffect(() => {
    const authListener = auth.onAuthStateChanged(user => {
      dispatch(actions.setStatus('loading'));
      if (user && user.uid) {
        // Signed in
        console.log("[authListener] signed in user:", user.uid);
        dispatch(actions.loadUser(user));
        // prompt user to save intro campaign
        if (introCampaignEdit) {
          let save = window.confirm("Would you like to save your work as a new campaign?");
          if (!save) {
            dispatch(fireactions.fetchActiveCampaignId());
            dispatch(fireactions.fetchCampaignList());
          } else {
            dispatch(fireactions.saveIntroCampaignData(campaignData,
              () => {
                dispatch(fireactions.fetchActiveCampaignId());
                dispatch(fireactions.fetchCampaignList());
              }
            ));
          }
        } else {
          dispatch(fireactions.fetchActiveCampaignId());
          dispatch(fireactions.fetchCampaignList());
        }
      } else {
        // Signed out
        console.log("[authListener] signed out");
        dispatch(actions.unloadUser());
        dispatch(actions.resetSessionManager());
        dispatch(actions.loadIntroCampaign());
      }
    });
    return () => authListener();
  }, [dispatch]);

  // Load data for active campaign
  useEffect(() => {
    if (userId) {
      dispatch(actions.setStatus('loading'));
      if (activeCampaignId) {
        dispatch(fireactions.fetchCampaignData(activeCampaignId));
      } else {
        dispatch(actions.setStatus('idle'));
      }
    }
  }, [dispatch, activeCampaignId]);

  // Set campaignEdit to true when campaignData changes.
  useEffect(() => {
    if (userId) {
      if ((status === 'idle') && campaignData && (Object.keys(campaignData).length !== 0)) {
        // set edit flag when idle
        dispatch(actions.setCampaignEdit(true));
      } else {
        // set status flag after loading data
        dispatch(actions.setStatus('idle'));
      }
    } else {
      if ((status === 'idle') && campaignData && (Object.keys(campaignData).length !== 0)) {
        // set edit flag when idle
        dispatch(actions.setIntroCampaignEdit(true));
      } else {
        // set status flag after loading data
        dispatch(actions.setStatus('idle'));
      }
    }
  }, [dispatch, campaignData]);

  // Autosave every minute
  useEffect(() => {
    const autoSave = setInterval(() => {
      if ((status=== 'idle') && userId && activeCampaignId && campaignEdit) {
        dispatch(actions.setStatus('saving'));
        dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData, 
          () => dispatch(actions.setStatus('idle'))
        ));
      }
    }, 60000);
    return () =>  clearInterval(autoSave);
  }, [dispatch, status, userId, activeCampaignId, campaignEdit, campaignData]);

  return (
    (status === 'loading')
      ? <>
          <Backdrop show={true} />
          <div className="loading-box">
            <Spinner />
            Loading...
          </div>
        </>
      : null
  );
};

export default Loader;