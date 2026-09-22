import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import NoteContent from './NoteContent';
import { buildNoteContent } from '../../constants/note';

// Hand-rolled fake store, matching the pattern in MonsterContent.test.jsx -
// no session.monsterCollapse needed here, note has no collapsible
// sections.
const makeStore = (content) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderNote = (content) => {
  const store = makeStore(content);
  const utils = render(<Provider store={store}><NoteContent cardId='c1' /></Provider>);
  return { ...utils, store };
};

describe('NoteContent', () => {
  it('renders the portrait, description, and entry list', () => {
    const { container, getByLabelText } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    expect(container.querySelector('.note-portrait')).not.toBeNull();
    expect(getByLabelText('Description').value).toBe('A dim tavern.');
    expect(container.querySelector('.monster-entry-list')).not.toBeNull();
  });

  it('typing in the description dispatches nothing; blurring dispatches exactly one updateCardNoteFields', () => {
    const { getByLabelText, store } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    const textarea = getByLabelText('Description');

    fireEvent.change(textarea, { target: { value: 'A bright tavern.' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(textarea);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCardNoteFields', payload: { id: 'c1', fields: { description: 'A bright tavern.' } } },
    ]);
  });

  it('blur with no net change dispatches nothing (equality guard)', () => {
    const { getByLabelText, store } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    const textarea = getByLabelText('Description');

    fireEvent.change(textarea, { target: { value: 'Something else' } });
    fireEvent.change(textarea, { target: { value: 'A dim tavern.' } });
    fireEvent.blur(textarea);

    expect(store.dispatched).toHaveLength(0);
  });

  it('Escape reverts without dispatching', () => {
    const { getByLabelText, store } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    const textarea = getByLabelText('Description');

    fireEvent.change(textarea, { target: { value: 'Something else' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(textarea.value).toBe('A dim tavern.');

    fireEvent.blur(textarea);
    expect(store.dispatched).toHaveLength(0);
  });
});

describe('NoteContent - entry list', () => {
  it('an empty note renders no entry boxes, just the add button', () => {
    const { container, getByText } = renderNote(buildNoteContent());
    expect(container.querySelectorAll('.monster-entry').length).toBe(0);
    expect(getByText('+ Add Detail')).not.toBeNull();
  });

  it('clicking add dispatches exactly one addNoteEntry with a generated entryId', () => {
    const { getByText, store } = renderNote(buildNoteContent());

    fireEvent.click(getByText('+ Add Detail'));

    expect(store.dispatched).toHaveLength(1);
    const action = store.dispatched[0];
    expect(action.type).toBe('project/addNoteEntry');
    expect(action.payload.id).toBe('c1');
    expect(typeof action.payload.entryId).toBe('string');
    expect(action.payload.entryId.length).toBeGreaterThan(0);
  });

  it('with two entries, duplicate/delete target only the clicked entry', () => {
    const content = buildNoteContent({
      entries: [
        { id: 'e1', name: 'Innkeeper Rosa', description: 'Gruff but fair.' },
        { id: 'e2', name: 'Hidden trapdoor', description: 'Behind the bar.' },
      ],
    });
    const { getByRole, store } = renderNote(content);

    fireEvent.click(getByRole('button', { name: 'Duplicate Detail 2' }));
    expect(store.dispatched).toHaveLength(1);
    let action = store.dispatched[0];
    expect(action.type).toBe('project/duplicateNoteEntry');
    expect(action.payload).toMatchObject({ id: 'c1', entryId: 'e2' });
    expect(typeof action.payload.newEntryId).toBe('string');
    expect(action.payload.newEntryId).not.toBe('e2');

    fireEvent.click(getByRole('button', { name: 'Delete Detail 1' }));
    expect(store.dispatched).toHaveLength(2);
    action = store.dispatched[1];
    expect(action).toEqual({
      type: 'project/deleteNoteEntry',
      payload: { id: 'c1', entryId: 'e1' },
    });
  });

  it('editing an entry name commits on blur', () => {
    const content = buildNoteContent({
      entries: [{ id: 'e1', name: 'Innkeeper Rosa', description: 'Gruff but fair.' }],
    });
    const { getByLabelText, store } = renderNote(content);
    const nameInput = getByLabelText('Detail 1 name');

    fireEvent.change(nameInput, { target: { value: 'Rosa the Bartender' } });
    fireEvent.blur(nameInput);

    expect(store.dispatched).toEqual([
      { type: 'project/updateNoteEntry', payload: { id: 'c1', entryId: 'e1', changes: { name: 'Rosa the Bartender' } } },
    ]);
  });
});
