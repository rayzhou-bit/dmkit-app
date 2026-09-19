import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CollapsibleSection from './CollapsibleSection';

describe('CollapsibleSection', () => {
  it('renders the title and a real button header', () => {
    const { getByText, container } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(getByText('Combat')).not.toBeNull();
    expect(container.querySelector('.monster-section-header').tagName).toBe('BUTTON');
  });

  it('aria-expanded mirrors !isCollapsed', () => {
    const { container, rerender } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(container.querySelector('.monster-section-header').getAttribute('aria-expanded')).toBe('true');

    rerender(
      <CollapsibleSection title='Combat' isCollapsed={true} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(container.querySelector('.monster-section-header').getAttribute('aria-expanded')).toBe('false');
  });

  it('children are present only when expanded', () => {
    const { container, queryByText, rerender } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(queryByText('body')).not.toBeNull();

    rerender(
      <CollapsibleSection title='Combat' isCollapsed={true} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(queryByText('body')).toBeNull();
    expect(container.querySelector('.monster-section-body')).toBeNull();
  });

  it('click calls onToggle once', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} dotCount={0} onToggle={onToggle}>
        <span>body</span>
      </CollapsibleSection>
    );
    fireEvent.click(container.querySelector('.monster-section-header'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('dots render only when collapsed AND dotCount > 0, one per count', () => {
    const cases = [
      [false, 0, 0],
      [false, 3, 0],
      [true, 0, 0],
      [true, 1, 1],
      [true, 3, 3],
    ];
    for (const [isCollapsed, dotCount, expectedDots] of cases) {
      const { container, unmount } = render(
        <CollapsibleSection title='Combat' isCollapsed={isCollapsed} dotCount={dotCount} onToggle={() => {}}>
          <span>body</span>
        </CollapsibleSection>
      );
      expect(container.querySelectorAll('.monster-section-dot').length).toBe(expectedDots);
      unmount();
    }
  });
});
