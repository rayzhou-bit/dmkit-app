import React from 'react';

import './Card.scss';

// Purely presentational - no Redux. Collapsed bodies are unmounted, not
// merely hidden, so a collapsed section's inputs are truly absent from the DOM.
const CollapsibleSection = ({
  title,
  isCollapsed,
  hasContent,
  onToggle,
  children,
}) => (
  <section className='monster-section'>
    <button
      type='button'
      className='monster-section-header'
      aria-expanded={!isCollapsed}
      onClick={onToggle}
    >
      <span className='monster-section-caret'>{isCollapsed ? '▸' : '▾'}</span>
      <span className='monster-section-title'>{title}</span>
      {isCollapsed && hasContent && <span className='monster-section-dot' />}
    </button>
    {!isCollapsed && <div className='monster-section-body'>{children}</div>}
  </section>
);

export default CollapsibleSection;
