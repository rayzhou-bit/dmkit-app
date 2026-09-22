import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import LibraryContent from './LibraryContent';
import { buildMonsterContent } from '../../constants/monster';
import { buildNoteContent } from '../../constants/note';
import { buildCustomContent } from '../../constants/custom';

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
    expect(container.querySelector('.library-note-condensed')).toBeNull();
  });

  it('renders LibraryImageContent for an image card', () => {
    const store = makeStore({ c2: { type: 'image', content: { image: '', alt: '' } } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c2' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-monster-condensed')).toBeNull();
    expect(container.querySelector('.library-note-condensed')).toBeNull();
  });

  it('renders LibraryMonsterContent for a monster card', () => {
    const store = makeStore({ c3: { type: 'monster', content: buildMonsterContent({ armorClass: '18' }) } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c3' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-monster-condensed')).not.toBeNull();
  });

  it('renders LibraryNoteContent for a note card', () => {
    const store = makeStore({ c4: { type: 'note', content: buildNoteContent({ description: 'A dim tavern.' }) } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c4' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-note-condensed')).not.toBeNull();
    expect(container.querySelector('.library-monster-condensed')).toBeNull();
  });

  it('renders LibraryCustomContent for a custom card', () => {
    const store = makeStore({ c5: { type: 'custom', content: buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'hi' }] }) } });
    const { container } = render(
      <Provider store={store}><LibraryContent cardId='c5' isExpanded={false} isSelected={false} setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.library-custom-condensed')).not.toBeNull();
    expect(container.querySelector('.library-monster-condensed')).toBeNull();
  });
});
