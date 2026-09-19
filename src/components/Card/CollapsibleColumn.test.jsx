import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CollapsibleColumn from './CollapsibleColumn';

describe('CollapsibleColumn', () => {
  it('renders the title and a real button header', () => {
    const { getByText, container } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(getByText('Combat')).not.toBeNull();
    expect(container.querySelector('.monster-column-header').tagName).toBe('BUTTON');
  });

  it('aria-expanded mirrors !isCollapsed', () => {
    const { container, rerender } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(container.querySelector('.monster-column-header').getAttribute('aria-expanded')).toBe('true');

    rerender(
      <CollapsibleColumn title='Combat' isCollapsed={true} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(container.querySelector('.monster-column-header').getAttribute('aria-expanded')).toBe('false');
  });

  it('children are present only when expanded', () => {
    const { container, queryByText, rerender } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(queryByText('body')).not.toBeNull();

    rerender(
      <CollapsibleColumn title='Combat' isCollapsed={true} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(queryByText('body')).toBeNull();
    expect(container.querySelector('.monster-column-body')).toBeNull();
  });

  it('click calls onToggle once', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} dotCount={0} onToggle={onToggle}>
        <span>body</span>
      </CollapsibleColumn>
    );
    fireEvent.click(container.querySelector('.monster-column-header'));
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
        <CollapsibleColumn title='Combat' isCollapsed={isCollapsed} dotCount={dotCount} onToggle={() => {}}>
          <span>body</span>
        </CollapsibleColumn>
      );
      expect(container.querySelectorAll('.monster-column-dot').length).toBe(expectedDots);
      unmount();
    }
  });

  it('the title text stays in the DOM when collapsed, and the root carries the collapsed class', () => {
    const { getByText, container } = render(
      <CollapsibleColumn title='Combat' isCollapsed={true} dotCount={0} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(getByText('Combat')).not.toBeNull();
    expect(container.querySelector('.monster-column-collapsed')).not.toBeNull();
  });
});
