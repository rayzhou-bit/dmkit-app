import React from 'react';

const FullCard = props => {
  return (
    <div ref={cardRef} className="card" style={cardStyle}
      onClick={cardClickHandler}
      onAnimationEnd={onAnimationEnd}>
      <CardTitle cardId={cardId} setEditingCard={setEditingCard} />
      <CardContent cardId={cardId} setEditingCard={setEditingCard} />
    </div>
  );
};

export default FullCard;