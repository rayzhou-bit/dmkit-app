import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewScreen.scss';
import * as actions from '../../store/actionIndex';
import Auxi from '../../hoc/Auxi';
import SavePopUp from '../../components/SavePopUp/savePopUp'
import Card from '../Card/Card';
import Library from '../../containers/Library/Library';

// ViewScreen is the main portion the user is looking at. This is located in the center of the screen.

const ViewScreen = (props) => {
  const dispatch = useDispatch();

  // VARIABLES
  const [saving, setSaving] = useState(false); //this will look to serverside campaign state later

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cardColl = useSelector(state => state.card);
  // const cardDelete = useSelector(state => state.cardManage.cardDelete);
  // const viewColl = useSelector(state => state.view);
  // const viewOrder = useSelector(state => state.viewManage.viewOrder);
  // const viewDelete = useSelector(state => state.viewManage.viewDelete);
  const activeView = useSelector(state => state.viewManage.activeView);

  const viewScreenRef = useRef("viewscreen");

  // FUNCTIONS
  const fetchFromFirebase = () => {
    dispatch(actions.fetchCardColl(user, campaign));
    dispatch(actions.fetchViewColl(user, campaign, activeView));
  };
  useEffect(() => { fetchFromFirebase() }, []);

  // Save edited data when closing window
  // const saveEditedData = useCallback(() => {
  //   dispatch(actions.saveCards(user, campaign, cardColl, cardDelete));
  //   dispatch(actions.saveViews(user, campaign, viewColl, viewDelete, viewOrder));
  // }, []);
  // useEffect(() => {
  //   window.addEventListener("beforeunload", saveEditedData);
  //   return () => {
  //     document.removeEventListener("beforeunload", saveEditedData);
  //   }
  // }, [saveEditedData]);

  let viewScreenStyle = {
    backgroundColor: activeView ? "white" : "lightgray",
  };

  let cardObjs = [];
  if (cardColl) {
    for (let cardId in cardColl) {
      if (cardColl[cardId].views && cardColl[cardId].views[activeView]) {
        cardObjs = [
          ...cardObjs,
          <Card key={cardId} id={cardId}/>,
        ];
      }
    }
  }

  return (
    <Auxi>
      <div ref={viewScreenRef} id="viewScreen" style={viewScreenStyle}>
        {cardObjs}
        {saving ? <SavePopUp /> : null}
        <Library/>
      </div>
    </Auxi>
  );
};

export default ViewScreen;