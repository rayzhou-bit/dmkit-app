import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./ViewScreen.scss";
import * as actions from "../../store/actionIndex";
import Card from "../Card/Card";

// ViewScreen is the main portion the user is looking at. This is located in the center of the screen.

const ViewScreen = (props) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cardColl = useSelector(state => state.card);
  // const cardDelete = useSelector(state => state.cardManage.cardDelete);
  // const viewColl = useSelector(state => state.view);
  // const viewOrder = useSelector(state => state.viewManage.viewOrder);
  // const viewDelete = useSelector(state => state.viewManage.viewDelete);
  const activeView = useSelector(state => state.viewManage.activeView);

  // Fetch card data from server
  const fetchFromFirebase = useCallback(() => {
    dispatch(actions.fetchCardColl(user, campaign));
    dispatch(actions.fetchViewColl(user, campaign, activeView));
  }, []);
  useEffect(() => { fetchFromFirebase() }, [fetchFromFirebase]);

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

  let cardObjs = [];
  if (cardColl) {
    for (let card in cardColl) {
      if (cardColl[card].views && cardColl[card].views[activeView]) {
        cardObjs = [
          ...cardObjs,
          <Card key={card} id={card}/>,
        ];
      }
    }
  }

  return <div id="viewScreen">{cardObjs}</div>;
};

export default ViewScreen;
