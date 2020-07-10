import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./ViewScreen.scss";
import * as actions from "../../store/actionIndex";
import Card from "../Card/Card";

const ViewScreen = (props) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.campaign.user);
  const campaign = useSelector((state) => state.campaign.campaign);
  const cards = useSelector((state) => state.cards.cards);
  const views = useSelector((state) => state.views.views);
  const viewOrder = useSelector((state) => state.views.viewOrder);
  const viewDelete = useSelector((state) => state.views.viewDelete);
  const activeView = useSelector((state) => state.views.activeView);

  const fetchCards = useCallback(() => dispatch(actions.fetchCards(user, campaign)), []);
  const fetchViews = useCallback(() => dispatch(actions.fetchViews(user, campaign, activeView)), []);
  const saveEditedData = () => {
    dispatch(actions.saveEditedCardData(user, campaign, cards));
    dispatch(actions.saveEditedViewData(user, campaign, views, viewOrder, viewDelete));
  };
  
  useEffect(() => { //Fetch card data from server
    fetchCards();
    fetchViews();
  }, [fetchCards, fetchViews]);

  // useEffect(() => { //Save edited data when closing window
  //   window.addEventListener("beforeunload", saveEditedData);
  //   return () => {
  //     document.removeEventListener("beforeunload", saveEditedData);
  //   }
  // }, [saveEditedData]);

  let cardObjs = [];
  if (cards) {
    for (let id in cards) {
      if (cards[id] && cards[id].views && cards[id].views[activeView]) {
        cardObjs = [
          ...cardObjs,
          <Card key={id} id={id}/>,
        ];
      }
    }
  }

  return <div id="viewScreen">{cardObjs}</div>;
};

export default ViewScreen;
