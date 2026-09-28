import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import CardRefPicker from './CardRefPicker';

const RECT = { top: 100, bottom: 120, left: 50, width: 200 };

describe('CardRefPicker', () => {
  it('renders nothing when there is no anchor rect', () => {
    const { container } = render(
      <CardRefPicker rect={null} results={[]} highlightedIndex={0} onSelect={() => {}} onHighlight={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows an empty state when there are no results', () => {
    const { getByText } = render(
      <CardRefPicker rect={RECT} results={[]} highlightedIndex={0} onSelect={() => {}} onHighlight={() => {}} />
    );
    expect(getByText('No matching cards')).not.toBeNull();
  });

  it('lists each result by title', () => {
    const results = [{ id: 'c1', title: 'Goblin' }, { id: 'c2', title: 'Tavern' }];
    const { getByText } = render(
      <CardRefPicker rect={RECT} results={results} highlightedIndex={0} onSelect={() => {}} onHighlight={() => {}} />
    );
    expect(getByText('Goblin')).not.toBeNull();
    expect(getByText('Tavern')).not.toBeNull();
  });

  it('marks the highlighted result', () => {
    const results = [{ id: 'c1', title: 'Goblin' }, { id: 'c2', title: 'Tavern' }];
    const { getByText } = render(
      <CardRefPicker rect={RECT} results={results} highlightedIndex={1} onSelect={() => {}} onHighlight={() => {}} />
    );
    expect(getByText('Goblin').className).not.toMatch(/highlighted/);
    expect(getByText('Tavern').className).toMatch(/highlighted/);
  });

  it('clicking a result calls onSelect with that card', () => {
    const results = [{ id: 'c1', title: 'Goblin' }];
    const onSelect = vi.fn();
    const { getByText } = render(
      <CardRefPicker rect={RECT} results={results} highlightedIndex={0} onSelect={onSelect} onHighlight={() => {}} />
    );
    fireEvent.click(getByText('Goblin'));
    expect(onSelect).toHaveBeenCalledWith(results[0]);
  });

  it('hovering a result calls onHighlight with its index', () => {
    const results = [{ id: 'c1', title: 'Goblin' }, { id: 'c2', title: 'Tavern' }];
    const onHighlight = vi.fn();
    const { getByText } = render(
      <CardRefPicker rect={RECT} results={results} highlightedIndex={0} onSelect={() => {}} onHighlight={onHighlight} />
    );
    fireEvent.mouseEnter(getByText('Tavern'));
    expect(onHighlight).toHaveBeenCalledWith(1);
  });

  it('mousedown on the picker is prevented and does not bubble - keeps the host field focused and exempts it from outside-click handlers', () => {
    const results = [{ id: 'c1', title: 'Goblin' }];
    const { getByText } = render(
      <CardRefPicker rect={RECT} results={results} highlightedIndex={0} onSelect={() => {}} onHighlight={() => {}} />
    );

    const outsideHandler = vi.fn();
    document.addEventListener('mousedown', outsideHandler);

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    getByText('Goblin').dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(outsideHandler).not.toHaveBeenCalled();

    document.removeEventListener('mousedown', outsideHandler);
  });
});
