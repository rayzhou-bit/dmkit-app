import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import Content from './Content';
import { buildMonsterContent } from '../../constants/monster';
import { buildNoteContent } from '../../constants/note';
import { buildCustomContent } from '../../constants/custom';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
// session.monsterCollapse is read unconditionally by useMonsterSectionHooks.
const makeStore = (cards) => ({
  getState: () => ({ project: { present: { cards } }, session: { monsterCollapse: {} } }),
  dispatch: () => {},
  subscribe: () => () => {},
});

describe('Content (dispatcher)', () => {
  it('renders a textarea (no img) for a legacy card with no type', () => {
    const store = makeStore({ c1: { content: { text: 'hi' } } });
    const { container } = render(
      <Provider store={store}><Content cardId='c1' setEditingCard={() => {}} /></Provider>
    );
    const textarea = container.querySelector('textarea');
    expect(textarea).not.toBeNull();
    expect(textarea.value).toBe('hi');
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders an image/placeholder (no textarea) for an image card', () => {
    const store = makeStore({ c2: { type: 'image', content: { image: '', alt: '' } } });
    const { container } = render(
      <Provider store={store}><Content cardId='c2' setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('textarea')).toBeNull();
    expect(container.querySelector('.image-placeholder')).not.toBeNull();
  });

  it('renders monster sections (no textarea.text, no .image-placeholder) for a monster card', () => {
    const store = makeStore({ c3: { type: 'monster', content: buildMonsterContent() } });
    const { container } = render(
      <Provider store={store}><Content cardId='c3' setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.monster-content')).not.toBeNull();
    expect(container.querySelector('textarea.text')).toBeNull();
    expect(container.querySelector('.image-placeholder')).toBeNull();
  });

  it('renders note content (portrait/description/entries, no textarea.text) for a note card', () => {
    const store = makeStore({ c4: { type: 'note', content: buildNoteContent() } });
    const { container } = render(
      <Provider store={store}><Content cardId='c4' setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.note-content')).not.toBeNull();
    expect(container.querySelector('.note-portrait')).not.toBeNull();
    expect(container.querySelector('textarea.text')).toBeNull();
    expect(container.querySelector('.image-placeholder')).toBeNull();
  });

  it('renders custom blocks (no textarea.text, no .image-placeholder) for a custom card', () => {
    const store = makeStore({ c5: { type: 'custom', content: buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'hi' }] }) } });
    const { container } = render(
      <Provider store={store}><Content cardId='c5' setEditingCard={() => {}} /></Provider>
    );
    expect(container.querySelector('.custom-content')).not.toBeNull();
    expect(container.querySelector('.custom-block')).not.toBeNull();
    expect(container.querySelector('textarea.text')).toBeNull();
    expect(container.querySelector('.image-placeholder')).toBeNull();
  });
});
