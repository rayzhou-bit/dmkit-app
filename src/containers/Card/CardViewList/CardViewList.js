import React from 'react';

const CardViewList = React.memo((props) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.campaign.user);
  const campaign = useSelector((state) => state.campaign.campaign);
  const cards = useSelector((state) => state.cards.cards);

  const card = cards[props.id];

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