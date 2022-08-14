import React from 'react';
import { Rnd } from 'react-rnd';

import './index.scss';
import Title from './Title';
import Content from './Content';
import * as hooks from './hooks';

const Card = ({
  cardAnimation,
  cardId,
  setCardAnimation,
  toolMenuRef,
}) => {
  const {
    cardConfig,
    rndConfig,
    setEditingCard,
  } = hooks.useCardHooks({
    cardAnimation,
    cardId,
    setCardAnimation,
    toolMenuRef,
  });

  return (
    <Rnd {...rndConfig}>
      <div {...cardConfig}>
        <Title cardId={cardId} />
        <Content cardId={cardId} setEditingCard={setEditingCard} />
        {/* DropdownColor? */}
        {/* DropdownMenu? */}
      </div>
    </Rnd>
  );
};

export default Card;