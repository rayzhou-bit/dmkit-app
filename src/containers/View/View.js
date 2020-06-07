import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './View.scss';
import * as actions from '../../store/actionIndex';
import Card from '../Card/Card';

const ViewScreen = (props) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cards = useSelector(state => state.cards.cards);
  const activeView = useSelector(state => state.views.activeView);

  const fetchCards = useCallback(() => dispatch(actions.fetchCards(user, campaign)), []);

  useEffect(() => {
    console.log('ViewScreen: useEffect');
    fetchCards();
  }, [fetchCards]);

  let cardObjs = [];
  if (cards) {
    for (let id in cards) {
      if (cards[id]) {
        cardObjs = [
          ...cardObjs,
          <Card key={id} id={id} x={cards[id].x} y={cards[id].y} />
        ];
      }
    }
  }

  return (
    <div className="ViewScreen">
        {cardObjs}
    </div>
  );
};

export default ViewScreen;