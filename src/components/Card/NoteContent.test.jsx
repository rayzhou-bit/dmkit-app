import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
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
  // The description field starts in display mode (CardRefField) - clicking
  // its rendered text swaps in the real textarea, same pattern as
  // CustomContent.test.jsx's enterEdit.
  const enterEdit = (getByText) => fireEvent.mouseDown(getByText('A dim tavern.'));

  it('renders the portrait, description, and entry list', () => {
    const { container, getByText, getByLabelText } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    expect(container.querySelector('.note-portrait')).not.toBeNull();
    expect(getByText('A dim tavern.')).not.toBeNull();
    enterEdit(getByText);
    expect(getByLabelText('Description').value).toBe('A dim tavern.');
    expect(container.querySelector('.monster-entry-list')).not.toBeNull();
  });

  it('typing in the description dispatches nothing; blurring dispatches exactly one updateCardNoteFields', () => {
    const { getByText, getByLabelText, store } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    enterEdit(getByText);
    const textarea = getByLabelText('Description');

    fireEvent.change(textarea, { target: { value: 'A bright tavern.' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(textarea);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCardNoteFields', payload: { id: 'c1', fields: { description: 'A bright tavern.' } } },
    ]);
  });

  it('blur with no net change dispatches nothing (equality guard)', () => {
    const { getByText, getByLabelText, store } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    enterEdit(getByText);
    const textarea = getByLabelText('Description');

    fireEvent.change(textarea, { target: { value: 'Something else' } });
    fireEvent.change(textarea, { target: { value: 'A dim tavern.' } });
    fireEvent.blur(textarea);

    expect(store.dispatched).toHaveLength(0);
  });

  it('Escape reverts without dispatching', () => {
    const { getByText, getByLabelText, store } = renderNote(buildNoteContent({ description: 'A dim tavern.' }));
    enterEdit(getByText);
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

// Integration coverage for the "#" trigger (useCardRefTrigger/CardRefPicker)
// through both note fields that support it now - the description field
// (NoteTextField) and an entry's description textarea (NoteEntry); the
// entry's name input is explicitly out of scope (see NoteEntry.jsx's
// comment). Mirrors CustomContent.test.jsx's "card references" section -
// needs a richer store than makeStore above (other cards to search over,
// with titles/editedOn), so it builds its own.
describe('NoteContent - card references (# trigger)', () => {
  const makeRefStore = (content) => {
    const dispatched = [];
    const state = {
      project: {
        present: {
          cards: {
            c1: { title: 'Current Card', content },
            c2: { title: 'Goblin Camp', content: {}, editedOn: 5 },
            c3: { title: 'Tavern', content: {}, editedOn: 10 },
          },
        },
      },
    };
    return {
      getState: () => state,
      dispatched,
      dispatch: (action) => { dispatched.push(action); return action; },
      subscribe: () => () => {},
    };
  };

  const renderRefNote = (store) => {
    const utils = render(<Provider store={store}><NoteContent cardId='c1' /></Provider>);
    return { ...utils, store };
  };

  describe('description field', () => {
    it('a #[Title](id) token renders as a chip, not raw text', () => {
      const store = makeRefStore(buildNoteContent({ description: '#[Goblin Camp](c2)' }));
      const { getByText, queryByText } = renderRefNote(store);

      expect(getByText('Goblin Camp')).not.toBeNull();
      expect(queryByText('#[Goblin Camp](c2)')).toBeNull();
    });

    it('clicking the field swaps in a real textarea containing the raw token text', () => {
      const store = makeRefStore(buildNoteContent({ description: '#[Goblin Camp](c2)' }));
      const { getByText, getByLabelText } = renderRefNote(store);

      // A chip click navigates instead of entering edit mode (CardRefField
      // deliberately excludes it) - mousedown the display container itself,
      // not the chip, since the token is the field's only content here.
      fireEvent.mouseDown(getByText('Goblin Camp').closest('.card-ref-display'));
      expect(getByLabelText('Description').value).toBe('#[Goblin Camp](c2)');
    });

    it('typing "#" opens the picker; selecting a result inserts a well-formed token', () => {
      const store = makeRefStore(buildNoteContent());
      const { getByText, getByLabelText } = renderRefNote(store);

      // Empty description -> display mode shows the field's placeholder.
      fireEvent.mouseDown(getByText("What's this about? Jot down anything worth remembering."));
      const textarea = getByLabelText('Description');

      fireEvent.change(textarea, { target: { value: '#gob', selectionStart: 4, selectionEnd: 4 } });
      expect(screen.getByText('Goblin Camp')).not.toBeNull();
      expect(screen.queryByText('Current Card')).toBeNull(); // host card excluded
      expect(screen.queryByText('Tavern')).toBeNull(); // doesn't match the query

      fireEvent.keyDown(textarea, { key: 'Enter' });
      expect(textarea.value).toBe('#[Goblin Camp](c2)');

      fireEvent.blur(textarea);
      expect(store.dispatched).toContainEqual({
        type: 'project/updateCardNoteFields',
        payload: { id: 'c1', fields: { description: '#[Goblin Camp](c2)' } },
      });

      // Back in display mode, the token renders as a resolved chip, not raw text.
      expect(screen.getByText('Goblin Camp')).not.toBeNull();
      expect(screen.queryByText('#[Goblin Camp](c2)')).toBeNull();
    });

    it('a token whose target card no longer exists renders as a dangling chip, not raw text or nothing', () => {
      const store = makeRefStore(buildNoteContent({ description: '#[Ghost Card](ghost)' }));
      const { getByText, queryByText } = renderRefNote(store);

      const chip = getByText('Deleted card');
      expect(chip).not.toBeNull();
      expect(chip.className).toMatch(/card-ref-chip-inline-dangling/);
      expect(queryByText('#[Ghost Card](ghost)')).toBeNull();
    });
  });

  describe('entry description field', () => {
    const entryContent = buildNoteContent({
      entries: [{ id: 'e1', name: 'Innkeeper Rosa', description: '#[Goblin Camp](c2)' }],
    });

    it('a #[Title](id) token renders as a chip, not raw text', () => {
      const store = makeRefStore(entryContent);
      const { getByText, queryByText } = renderRefNote(store);

      expect(getByText('Goblin Camp')).not.toBeNull();
      expect(queryByText('#[Goblin Camp](c2)')).toBeNull();
    });

    it('clicking the field swaps in a real textarea containing the raw token text', () => {
      const store = makeRefStore(entryContent);
      const { getByText, getByLabelText } = renderRefNote(store);

      // See the description field's equivalent test above for why this
      // targets the display container, not the chip itself.
      fireEvent.mouseDown(getByText('Goblin Camp').closest('.card-ref-display'));
      expect(getByLabelText('Detail 1 description').value).toBe('#[Goblin Camp](c2)');
    });

    it('typing "#" opens the picker; selecting a result inserts a well-formed token', () => {
      const store = makeRefStore(buildNoteContent({
        entries: [{ id: 'e1', name: 'Innkeeper Rosa', description: '' }],
      }));
      const { getByText, getByLabelText } = renderRefNote(store);

      // Empty entry description -> display mode shows the entry's placeholder.
      fireEvent.mouseDown(getByText('What should you remember about it?'));
      const textarea = getByLabelText('Detail 1 description');

      fireEvent.change(textarea, { target: { value: '#tav', selectionStart: 4, selectionEnd: 4 } });
      expect(screen.getByText('Tavern')).not.toBeNull();

      fireEvent.keyDown(textarea, { key: 'Enter' });
      expect(textarea.value).toBe('#[Tavern](c3)');

      fireEvent.blur(textarea);
      expect(store.dispatched).toContainEqual({
        type: 'project/updateNoteEntry',
        payload: { id: 'c1', entryId: 'e1', changes: { description: '#[Tavern](c3)' } },
      });

      expect(screen.getByText('Tavern')).not.toBeNull();
      expect(screen.queryByText('#[Tavern](c3)')).toBeNull();
    });

    it('a token whose target card no longer exists renders as a dangling chip, not raw text or nothing', () => {
      const store = makeRefStore(buildNoteContent({
        entries: [{ id: 'e1', name: 'Innkeeper Rosa', description: '#[Ghost Card](ghost)' }],
      }));
      const { getByText, queryByText } = renderRefNote(store);

      const chip = getByText('Deleted card');
      expect(chip).not.toBeNull();
      expect(chip.className).toMatch(/card-ref-chip-inline-dangling/);
      expect(queryByText('#[Ghost Card](ghost)')).toBeNull();
    });
  });
});
