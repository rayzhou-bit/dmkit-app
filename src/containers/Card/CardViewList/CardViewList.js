import React from 'react';

const CardViewList = React.memo((props) => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.campaign.user);
  const campaign = useSelector(state => state.campaign.campaign);
  const cardColl = useSelector(state => state.card);

  const cardId = props.id;
  const cardData = cardColl[cardId];

  return (
    <div>
      <input
        type="checkbox"
      >
      </input>
    </div>
  );
});

export default CardViewList;