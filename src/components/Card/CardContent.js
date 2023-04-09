import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../../../store/actionIndex';
import ContentTextarea from '../../../UI/Inputs/ContentTextarea';

import './index.scss';

const CardContent = ({
  cardId,
  setEditingCard,
}) => {
  const dispatch = useDispatch();

  // STORE SELECTORS
  const cardText = useSelector(state => state.campaignData.present.cards[cardId].content.text);

  // FUNCTIONS

  // STYLES

  return (
    <div className="card-content">
      <ContentTextarea className="text-textarea"
        value={cardText} saveValue={v => dispatch(actions.updCardText(cardId, v))}
        setEditingParent={setEditingCard} />
    </div>
  );
};

export default CardContent;