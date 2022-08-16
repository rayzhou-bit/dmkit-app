import React from 'react';
import { Rnd } from 'react-rnd';

import * as hooks from './hooks';

import './index.scss';
import Title from './Title';
import Content from './Content';
import ColorDropdown from './ColorDropdown';

const Card = ({
  cardAnimation,
  cardId,
  setCardAnimation,
  toolMenuRef,
}) => {
  const {
    cardConfig,
    colorDropdownRef,
    contentConfig,
    rndConfig,
    showColorDropdown,
    showMenuDropdown,
    titleConfig,
  } = hooks.useCardHooks({
    cardAnimation,
    cardId,
    setCardAnimation,
    toolMenuRef,
  });

  return (
    <Rnd {...rndConfig}>
      <div {...cardConfig}>
        <Title
          cardId={cardId}
          showColorDropdown={showColorDropdown}
          showMenuDropdown={showMenuDropdown}
          titleConfig={titleConfig}
        />
        <Content textareaConfig={contentConfig} />
        {showColorDropdown
          ? <ColorDropdown cardId={cardId} colorDropdownRef={colorDropdownRef} />
          : null}
        {/* DropdownMenu? */}
      </div>
    </Rnd>
  );
};

export default Card;