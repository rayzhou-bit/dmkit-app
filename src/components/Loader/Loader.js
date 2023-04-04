import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';

import './Loader.scss';
import * as actions from '../../store/actionIndex';
import * as fireactions from '../../store/firestoreIndex';
import { auth } from '../../store/firestoreAPI/firebase';
import Backdrop from '../UI/Backdrop/Backdrop';
import Spinner from '../UI/Spinner/Spinner';
import { manageUser } from '../../store/firestoreAPI/authTransactions';

// Manages loading, saving and campaignData edit flag

const Loader = props => {
  const dispatch = useDispatch();
  
  // STORE SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const status = useSelector(state => state.sessionManager.status);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignEdit = useSelector(state => state.sessionManager.campaignEdit);
  const introCampaignEdit = useSelector(state => state.sessionManager.introCampaignEdit);
  const campaignData = useSelector(state => state.campaignData.present);
  const latestUnfiltered = useSelector(state => state.campaignData._latestUnfiltered);
  
  // Auth listener
  useEffect(() => {
    const authListener = manageUser({ dispatch, introCampaignEdit, campaignData });
    return () => authListener();
  }, [dispatch]);

  // Load data for active campaign
  useEffect(() => {
    if (userId) {
      // dispatch(actions.setStatus('loading'));
      if (activeCampaignId) dispatch(fireactions.fetchCampaignData(activeCampaignId, 
        () => dispatch(ActionCreators.clearHistory())));
      else {
        console.log("[Status] idle. Triggered by activeCampaignId change.");
        dispatch(actions.setStatus('idle'));
      }
    }
  }, [dispatch, activeCampaignId]);

  // Set campaignEdit to true when campaignData changes.
  useEffect(() => {
    if (userId) {
      if ((status === 'idle') && campaignData && (Object.keys(campaignData).length !== 0)) {
        // set edit flag when idle
        if (!campaignEdit) dispatch(actions.setCampaignEdit(true));
      } else {
        // set status flag after loading data
        console.log("[Status] idle. Triggered by post-load.");
        dispatch(actions.setStatus('idle'));
      }
    } else {
      if ((status === 'idle') && campaignData && (Object.keys(campaignData).length !== 0)) {
        // set edit flag when idle
        if (!introCampaignEdit) dispatch(actions.setIntroCampaignEdit(true));
      } else {
        // set status flag after loading data
        console.log("[Status] idle. Triggered by post-load.");
        dispatch(actions.setStatus('idle'));
      }
    }
  }, [dispatch, latestUnfiltered]);

  // Autosave every minute
  useEffect(() => {
    const autoSave = setInterval(() => {
      if ((status=== 'idle') && userId && activeCampaignId && campaignEdit) {
        console.log("[Status] saving. Triggered by autosave.");
        dispatch(actions.setStatus('saving'));
        dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData, 
          () => {
            console.log("[Status] idle. Triggered by autosave completion.");
            dispatch(actions.setStatus('idle'))
          }
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