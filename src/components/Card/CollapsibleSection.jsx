import React from 'react';

import './Card.scss';

// Purely presentational - no Redux. Collapsed bodies are unmounted, not
// merely hidden, so a collapsed section's inputs are truly absent from the DOM.
const CollapsibleSection = ({
  title,
  isCollapsed,
  dotCount, // 0 = empty; one dot per field/entry with content, capped (see useMonsterSectionHooks)
  onToggle,
  children,
}) => (
  <section className='monster-section'>
    <button
      type='button'
      className={'monster-section-header' + (isCollapsed && !dotCount ? ' monster-section-header-empty' : '')}
      aria-expanded={!isCollapsed}
      onClick={onToggle}
    >
      <span className='monster-section-caret'>{isCollapsed ? '▸' : '▾'}</span>
      <span className='monster-section-title'>{title}</span>
      {isCollapsed && dotCount > 0 && (
        <span className='monster-section-dots'>
          {Array.from({ length: dotCount }, (_, i) => <span key={i} className='monster-section-dot' />)}
        </span>
      )}
    </button>
    {!isCollapsed && <div className='monster-section-body'>{children}</div>}
  </section>
);

export default CollapsibleSection;
