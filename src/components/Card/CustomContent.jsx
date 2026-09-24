import React from 'react';

import CustomBlockList from './CustomBlockList';

import './Card.scss';

// Canvas body for the custom card type - the direct successor to the
// plain text/image cards: an open-ended, freely-ordered list of text/image
// blocks, added as many as wanted (see CustomBlockList.jsx). Nothing here
// is required - see constants/custom.js's customHasContent.
const CustomContent = ({ cardId }) => (
  <div className='custom-content'>
    <CustomBlockList cardId={cardId} />
  </div>
);

export default CustomContent;
