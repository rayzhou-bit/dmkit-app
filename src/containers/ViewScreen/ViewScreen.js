import React, { useReducer } from 'react';

import Card from '../Card/Card';

const viewScreen = props => {
  const [cards, setCards] = useState([
    {id: 1,
    x: 1,
    y: 1},
    {id: 2,
    x: 1,
    y: 1},
    {id: 3,
    x: 1,
    y: 1},
  ]);

  return (
    <div>
      {cards.map(data => (
        <Card id={data.id} position={data.x,data.y} />
      ))}
    </div>
  );
};

export default viewScreen;