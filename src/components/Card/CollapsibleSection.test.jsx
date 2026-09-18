import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CollapsibleSection from './CollapsibleSection';

describe('CollapsibleSection', () => {
  it('renders the title and a real button header', () => {
    const { getByText, container } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(getByText('Combat')).not.toBeNull();
    expect(container.querySelector('.monster-section-header').tagName).toBe('BUTTON');
  });

  it('aria-expanded mirrors !isCollapsed', () => {
    const { container, rerender } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(container.querySelector('.monster-section-header').getAttribute('aria-expanded')).toBe('true');

    rerender(
      <CollapsibleSection title='Combat' isCollapsed={true} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(container.querySelector('.monster-section-header').getAttribute('aria-expanded')).toBe('false');
  });

  it('children are present only when expanded', () => {
    const { container, queryByText, rerender } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(queryByText('body')).not.toBeNull();

    rerender(
      <CollapsibleSection title='Combat' isCollapsed={true} hasContent={false} onToggle={() => {}}>
        <span>body</span>
      </CollapsibleSection>
    );
    expect(queryByText('body')).toBeNull();
    expect(container.querySelector('.monster-section-body')).toBeNull();
  });

  it('click calls onToggle once', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <CollapsibleSection title='Combat' isCollapsed={false} hasContent={false} onToggle={onToggle}>
        <span>body</span>
      </CollapsibleSection>
    );
    fireEvent.click(container.querySelector('.monster-section-header'));
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
        <CollapsibleSection title='Combat' isCollapsed={isCollapsed} hasContent={hasContent} onToggle={() => {}}>
          <span>body</span>
        </CollapsibleSection>
      );
      expect(!!container.querySelector('.monster-section-dot')).toBe(expectDot);
      unmount();
    }
  });
});
