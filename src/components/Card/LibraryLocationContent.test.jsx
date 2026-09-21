import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import LibraryLocationContent from './LibraryLocationContent';
import { buildLocationContent } from '../../constants/location';

// Hand-rolled fake store, matching the pattern in LibraryMonsterContent.test.jsx -
// no collapse state needed here, location has no collapsible sections.
const makeStore = (content) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderLibraryLocation = (content, props = {}) => {
  const store = makeStore(content);
  const utils = render(
    <Provider store={store}>
      <LibraryLocationContent cardId='c1' isExpanded={false} isSelected={false} setEditingCard={() => {}} {...props} />
    </Provider>
  );
  return { ...utils, store };
};

describe('LibraryLocationContent - empty state', () => {
  it('shows the empty label for fully-empty content', () => {
    const { getByText, container } = renderLibraryLocation(buildLocationContent());
    expect(getByText('No location details yet')).not.toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });
});

describe('LibraryLocationContent - condensed view (unselected, not expanded)', () => {
  it('is 80px tall and shows the description as the summary line', () => {
    const content = buildLocationContent({ description: 'A dim tavern that smells of salt.' });
    const { container, getByText } = renderLibraryLocation(content);
    const wrapper = container.querySelector('.library-card-content-container');
    expect(wrapper.style.height).toBe('80px');
    expect(getByText('A dim tavern that smells of salt.')).not.toBeNull();
  });

  it('falls back to entry names, comma-joined, when description is empty', () => {
    const content = buildLocationContent({
      entries: [
        { id: 'e1', name: 'Innkeeper Rosa', description: '' },
        { id: 'e2', name: 'Hidden trapdoor', description: '' },
      ],
    });
    const { getByText } = renderLibraryLocation(content);
    expect(getByText('Innkeeper Rosa, Hidden trapdoor')).not.toBeNull();
  });

  it('renders no input or textarea - stays fully read-only, unlike the expanded view', () => {
    const content = buildLocationContent({
      description: 'A dim tavern.',
      portrait: 'data:image/jpeg;base64,x',
      entries: [{ id: 'e1', name: 'Rosa', description: 'Gruff.' }],
    });
    const { container } = renderLibraryLocation(content);
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });

  it('shows the portrait thumbnail when set', () => {
    const content = buildLocationContent({ description: 'x', portrait: 'data:image/jpeg;base64,x', portraitAlt: 'A map' });
    const { container } = renderLibraryLocation(content);
    const thumb = container.querySelector('.library-location-thumb');
    expect(thumb).not.toBeNull();
    expect(thumb.alt).toBe('A map');
  });
});

describe('LibraryLocationContent - expanded view (selected or isExpanded)', () => {
  it('renders the portrait, an editable description, and the entry list', () => {
    const content = buildLocationContent({ description: 'A dim tavern.' });
    const { container, getByLabelText } = renderLibraryLocation(content, { isExpanded: true });
    expect(container.querySelector('.location-portrait')).not.toBeNull();
    expect(getByLabelText('Description').value).toBe('A dim tavern.');
    expect(container.querySelector('.monster-entry-list')).not.toBeNull();
  });

  it('empty fields still render (with placeholders), unlike the condensed view', () => {
    const { getByLabelText, getByText } = renderLibraryLocation(buildLocationContent({ description: 'x' }), { isExpanded: true });
    expect(getByLabelText('Description')).not.toBeNull();
    expect(getByText('+ Add Detail')).not.toBeNull();
  });

  it('typing in the description dispatches nothing; blurring dispatches exactly one updateCardLocationFields', () => {
    const content = buildLocationContent({ description: 'A dim tavern.' });
    const { getByLabelText, store } = renderLibraryLocation(content, { isExpanded: true });
    const textarea = getByLabelText('Description');

    fireEvent.change(textarea, { target: { value: 'A bright tavern.' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(textarea);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCardLocationFields', payload: { id: 'c1', fields: { description: 'A bright tavern.' } } },
    ]);
  });
});
