import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import LibraryContent from './LibraryContent';
import { buildMonsterContent } from '../../constants/monster';
import { buildLocationContent } from '../../constants/location';

// Hand-rolled fake store, matching the pattern in Content.test.jsx -
// libraryMonsterCollapse is read unconditionally by useMonsterSectionHooks
// (Library scope) when a monster card is rendered expanded.
const makeStore = (cards) => ({
  getState: () => ({ project: { present: { cards } }, session: { libraryMonsterCollapse: {} } }),
  dispatch: () => {},
  subscribe: () => () => {},
});

describe('LibraryContent (dispatcher)', () => {
  it('renders library text content for a legacy card with no type', () => {
    const store = makeStore({ c1: { content: { text: 'hi' } } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c1' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-monster-condensed')).toBeNull();
    expect(container.querySelector('.library-location-condensed')).toBeNull();
  });

  it('renders LibraryImageContent for an image card', () => {
    const store = makeStore({ c2: { type: 'image', content: { image: '', alt: '' } } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c2' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-monster-condensed')).toBeNull();
    expect(container.querySelector('.library-location-condensed')).toBeNull();
  });

  it('renders LibraryMonsterContent for a monster card', () => {
    const store = makeStore({ c3: { type: 'monster', content: buildMonsterContent({ armorClass: '18' }) } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c3' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-monster-condensed')).not.toBeNull();
  });

  it('renders LibraryLocationContent for a location card', () => {
    const store = makeStore({ c4: { type: 'location', content: buildLocationContent({ description: 'A dim tavern.' }) } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c4' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-location-condensed')).not.toBeNull();
    expect(container.querySelector('.library-monster-condensed')).toBeNull();
  });
});
