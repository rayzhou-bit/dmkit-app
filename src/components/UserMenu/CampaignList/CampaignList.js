import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './CampaignList.scss';
import * as fireactions from '../../../store/firestoreIndex';
import Campaign from './Campaign/Campaign';

const CampaignList = props => {
  const {setShowCampaignDropdown} = props;
  const dispatch = useDispatch();

  // SELECTORS
  const userId = useSelector(state => state.userData.userId);
  const campaignList = useSelector(state => state.sessionManager.campaignList);
  const activeCampaignId = useSelector(state => state.sessionManager.activeCampaignId);
  const campaignData = useSelector(state => state.campaignData);

  // FUNCTIONS
  const newCampaign = () => {
    if (activeCampaignId) {
      dispatch(fireactions.saveCampaignData(activeCampaignId, campaignData,
        () => dispatch(fireactions.createCampaign())
      ));
    } else {
      dispatch(fireactions.createCampaign());
    }
  };

  let campaignSelect = [];
  if (userId) {
    for (let campaignId in campaignList) {
      campaignSelect = [
        ...campaignSelect,
        <Campaign key={campaignId}
          campaignId={campaignId} campaignTitle={campaignList[campaignId]} 
          setShowCampaignDropdown={setShowCampaignDropdown}
        />,
      ];
    };
    campaignSelect = [
      ...campaignSelect,
      <button key="newCampaign" className="new-campaign btn-any" onClick={newCampaign}>New Project</button>
    ];
  }

  return (
    <div className="campaign-select">
      {campaignSelect}
    </div>
  )
};

export default CampaignList;