import React from 'react';

import './Card.scss';

// Presentational, no Redux - structural twin of CollapsibleSection, but
// contains CollapsibleSections rather than fields, and collapses to a thin
// vertical strip (Card.scss) instead of just hiding its body. Collapsed
// bodies are unmounted, not merely hidden, so a collapsed column's inputs
// are truly absent from the DOM.
const CollapsibleColumn = ({
  title,
  isCollapsed,
  hasContent,
  onToggle,
  children,
}) => (
  <section className={'monster-column' + (isCollapsed ? ' monster-column-collapsed' : '')}>
    <button
      type='button'
      className={'monster-column-header' + (isCollapsed && !hasContent ? ' monster-column-header-empty' : '')}
      aria-expanded={!isCollapsed}
      onClick={onToggle}
    >
      <span className='monster-column-caret'>{isCollapsed ? '▸' : '▾'}</span>
      <span className='monster-column-title'>{title}</span>
      {isCollapsed && hasContent && <span className='monster-column-dot' />}
    </button>
    {!isCollapsed && <div className='monster-column-body'>{children}</div>}
  </section>
);

export default CollapsibleColumn;
