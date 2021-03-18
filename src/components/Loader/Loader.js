import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const campaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignEdit = useSelector(state => state.sessionManager.campaignEdit);
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
        if (campaignEdit) {
          let save = window.confirm("Would you like to save your work as a new campaign?");
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
      } else {
        // Signed out
        console.log("[authListener] signed out");
        dispatch(actions.unloadUser());
        dispatch(actions.resetSessionManager());
        dispatch(actions.loadIntroCampaign());
        dispatch(actions.setStatus("idle"));
      }
    });
    return () => authListener();
  }, [dispatch]);

  // Autosave every 5 minutes
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (userId && campaignId && campaignEdit) {
        dispatch(fireactions.saveCampaignData(campaignId, campaignData));
      }
    }, 5000);
    return () =>  clearInterval(autoSave);
  }, [dispatch, userId, campaignId, campaignEdit, campaignData]);

  // Load data for active campaign
  useEffect(() => {
    if (campaignId) {
      dispatch(fireactions.fetchCampaignData(campaignId));
    }
  }, [dispatch, campaignId]);

  // Set campaignEdit to true when campaignData changes.
  useEffect(() => {
    if (campaignData) {
      dispatch(actions.setCampaignEdit(true));
    }
  }, [dispatch, campaignData]);

  return (
    (status === 'loading')
      ? <>
          <Backdrop show={true} />
          <div className="loading-box">
            <Spinner />
            Loading...
          </div>
        </>
    : (status === 'saving')
      ? null
      : null
  );
};

export default Loader;