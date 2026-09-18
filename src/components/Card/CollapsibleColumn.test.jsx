import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CollapsibleColumn from './CollapsibleColumn';

describe('CollapsibleColumn', () => {
  it('renders the title and a real button header', () => {
    const { getByText, container } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(getByText('Combat')).not.toBeNull();
    expect(container.querySelector('.monster-column-header').tagName).toBe('BUTTON');
  });

  it('aria-expanded mirrors !isCollapsed', () => {
    const { container, rerender } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(container.querySelector('.monster-column-header').getAttribute('aria-expanded')).toBe('true');

    rerender(
      <CollapsibleColumn title='Combat' isCollapsed={true} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(container.querySelector('.monster-column-header').getAttribute('aria-expanded')).toBe('false');
  });

  it('children are present only when expanded', () => {
    const { container, queryByText, rerender } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(queryByText('body')).not.toBeNull();

    rerender(
      <CollapsibleColumn title='Combat' isCollapsed={true} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(queryByText('body')).toBeNull();
    expect(container.querySelector('.monster-column-body')).toBeNull();
  });

  it('click calls onToggle once', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <CollapsibleColumn title='Combat' isCollapsed={false} hasContent={false} onToggle={onToggle}>
        <span>body</span>
      </CollapsibleColumn>
    );
    fireEvent.click(container.querySelector('.monster-column-header'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('the dot renders only when collapsed AND hasContent', () => {
    const cases = [
      [false, false, false],
      [false, true, false],
      [true, false, false],
      [true, true, true],
    ];
    for (const [isCollapsed, hasContent, expectDot] of cases) {
      const { container, unmount } = render(
        <CollapsibleColumn title='Combat' isCollapsed={isCollapsed} hasContent={hasContent} onToggle={() => {}}>
          <span>body</span>
        </CollapsibleColumn>
      );
      expect(!!container.querySelector('.monster-column-dot')).toBe(expectDot);
      unmount();
    }
  });

  it('the title text stays in the DOM when collapsed, and the root carries the collapsed class', () => {
    const { getByText, container } = render(
      <CollapsibleColumn title='Combat' isCollapsed={true} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleColumn>
    );
    expect(getByText('Combat')).not.toBeNull();
    expect(container.querySelector('.monster-column-collapsed')).not.toBeNull();
  });
});
