import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';

import './BubbleForm.scss';
import * as actions from '../../../../store/actionIndex';
import { useOutsideClick } from '../../../../shared/utilityFunctions';
import { GRID } from '../../../../shared/constants/grid';
import { CARD_FONT_SIZE } from '../../../../shared/constants/fontSize';
import { TEXT_COLOR_WHEN_BACKGROUND_IS } from '../../../../shared/constants/colors';

const BubbleForm = props => {
  const {cardId, cardRef, toolMenuRef,
    isSelected, setIsSelected, setDragging,
    dragStopHandler, cardClickHandler,
    toFrontStyle, cardStyle,
    onAnimationEnd,
  } = props;
  const dispatch = useDispatch();


  // STORE SELECTORS
  const activeCardId = useSelector(state => state.campaignData.activeCardId);
  const activeViewId = useSelector(state => state.campaignData.activeViewId);
  const cardPos = useSelector(state => state.campaignData.cards[cardId].views[activeViewId].pos);
  const cardColor = useSelector(state => state.campaignData.cards[cardId].color);
  // const cardColorForView = useSelector(state => state.campaignData.cards[cardId].views[activeViewId].color);
  // const cardColorToDisplay = cardColorForView ? cardColorForView : cardColor ? cardColor : "gray";
  const cardColorToDisplay = cardColor;
  const cardTitle = useSelector(state => state.campaignData.cards[cardId].title);
  
  // FUNCTIONS
  const changeTypeToCard = () => dispatch(actions.updCardForm(cardId, "card"));
  
  useOutsideClick([cardRef, toolMenuRef], isSelected, 
    () => {
      if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
      setIsSelected(false);
    }
  );
  
  // STYLES
  const bubbleLetterStyle = {
    fontSize: CARD_FONT_SIZE.title+'px',
    color: TEXT_COLOR_WHEN_BACKGROUND_IS[cardColorToDisplay],
    backgroundColor: cardColorToDisplay, 
  };

  return (
    <Rnd style={toFrontStyle}
      bounds="parent"
      // position
      position={cardPos}
      // drag
      dragGrid={[GRID.size, GRID.size]}
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={{width: GRID.size*3, height: GRID.size*1}}
      // resize
      enableResizing={false}
    >
      <div ref={cardRef} className="bubble" style={cardStyle}
        onClick={cardClickHandler}
        onDoubleClick={changeTypeToCard}
        onAnimationEnd={onAnimationEnd}>
        <div className="short" style={bubbleLetterStyle}>{cardTitle ? cardTitle.split(' ')[0] : ""}</div>
      </div>
    </Rnd>
  );
};

export default BubbleForm;