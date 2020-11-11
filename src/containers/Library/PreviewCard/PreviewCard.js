import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './PreviewCard.scss';
import * as actions from '../../../store/actionIndex';

import DeleteButton from '../../../media/icons/delete.svg';

const PreviewCard = React.memo(props => {
  const dispatch = useDispatch();

  const cardColl = useSelector(state => state.card);
  const activeCard = useSelector(state => state.cardManage.activeCard);
  // const activeView = useSelector(state => state.viewManage.activeView);

  const cardId = props.cardIndex;
  // const cardColor = cardData.views[activeView].color;

  const onClickCard = (clickedCard) => dispatch(actions.updActiveCard(clickedCard));
  const setCardDelete = () => dispatch(actions.setCardDelete(cardId));

  const card = cardColl[props.cardIndex];
  let cardTitle = "loading...";
  if (card.data && card.data.title) {
    cardTitle = card.data.title;
  }
  let cardText = "loading...";
  if (card.data && card.data.text) {
    cardText = card.data.text;
  }

  // delete should take TWO clicks
  
  // let cardStyle = {backgroundColor: cardColor};
  let cardStyle = {};
  if (cardId === activeCard) {
    cardStyle = {
      ...cardStyle,
      border: '3px solid black'
    };
  }
  let contentStyle = {};


  return (
    <div className="previewCard" 
      style={cardStyle} 
      onClick={(cardId === activeCard) ? null : (() => onClickCard(cardId))}>
      <div className="previewTitleBar">
        <div className="previewTitle">{cardTitle}</div>
        <div className="previewDeleteButton">
          <input type="image" src={DeleteButton} alt="Delete" onClick={setCardDelete} />
        </div>
      </div>
      <div className="previewContent">
        {cardText}
      </div>
    </div>
  );
});

export default PreviewCard;