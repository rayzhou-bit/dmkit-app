import React, { useEffect, useCallback, useReducer } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewScreen.scss';
import * as actions from '../../store/action/index';
import Card from '../Card/Card';
import ToolMenu from '../../components/ToolMenu/ToolMenu';

const ViewScreen = (props) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.viewScreen.user);
  const campaign = useSelector(state => state.viewScreen.campaign);
  const cards = useSelector(state => state.viewScreen.cards);

  const fetchCards = useCallback(() => dispatch(actions.fetchCards(user, campaign)), []);
  const addCard = useCallback(() => dispatch(actions.addCard(user, campaign)), []);

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
      <ToolMenu 
        addCard={addCard}
      />
      {cardObjs}
    </div>
  );
};

export default ViewScreen;