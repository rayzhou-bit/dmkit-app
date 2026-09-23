import React, { useRef } from 'react';

import CustomBlockList from './CustomBlockList';

import './Card.scss';

// Canvas body for the custom card type - the direct successor to the
// plain text/image cards: an open-ended, freely-ordered list of text/image
// blocks, added as many as wanted (see CustomBlockList.jsx). Nothing here
// is required - see constants/custom.js's customHasContent. tabIndex=-1 so
// deleting a block can fall focus back here instead of <body> - see
// CustomBlockList's handleDelete.
const CustomContent = ({ cardId }) => {
  const contentRef = useRef(null);

  return (
    <div className='custom-content' ref={contentRef} tabIndex={-1}>
      <CustomBlockList cardId={cardId} focusFallbackRef={contentRef} />
    </div>
  );
};

export default CustomContent;
