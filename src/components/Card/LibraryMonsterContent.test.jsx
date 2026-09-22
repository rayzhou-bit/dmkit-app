import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import LibraryMonsterContent from './LibraryMonsterContent';
import { buildMonsterContent } from '../../constants/monster';

// Hand-rolled fake store, matching the pattern in MonsterContent.test.jsx -
// libraryMonsterCollapse is a separate map from the canvas's monsterCollapse
// (see MONSTER_COLLAPSE_SCOPES). The 3 top-level groups (attributes/combat/
// notes) default OPEN here (LIBRARY_DEFAULT_COLLAPSED), unlike the canvas's
// default-collapsed columns - most tests don't need a collapse override to
// see fields; only the collapse-behavior tests do.
const makeStore = (content, collapseOverrides = {}) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({
      project: { present: { cards: { c1: { content } } } },
      session: { libraryMonsterCollapse: { c1: collapseOverrides } },
    }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderLibraryMonster = (content, collapseOverrides = {}, props = {}) => {
  const store = makeStore(content, collapseOverrides);
  const utils = render(
    <Provider store={store}>
      <LibraryMonsterContent cardId='c1' isExpanded={false} isSelected={false} setEditingCard={() => {}} {...props} />
    </Provider>
  );
  return { ...utils, store };
};

describe('LibraryMonsterContent - empty state', () => {
  it('shows the empty label for fully-empty content', () => {
    const { getByText, container } = renderLibraryMonster(buildMonsterContent());
    expect(getByText('No stat block yet')).not.toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });
});

describe('LibraryMonsterContent - condensed view (unselected, not expanded)', () => {
  it('is 80px tall and shows filled fields, omitting empty ones', () => {
    const content = buildMonsterContent({ size: 'Large', creatureType: 'dragon', armorClass: '18' });
    const { container, getByText } = renderLibraryMonster(content);
    const wrapper = container.querySelector('.library-card-content-container');
    expect(wrapper.style.height).toBe('80px');
    expect(getByText('Large dragon')).not.toBeNull();
    expect(getByText('AC 18')).not.toBeNull();
  });

  it('renders no input or textarea - stays fully read-only, unlike the expanded view', () => {
    const content = buildMonsterContent({
      creatureType: 'dragon', armorClass: '18', traits: [{ id: 'e1', name: 'Amphibious', description: '' }],
      portrait: 'data:image/jpeg;base64,x', notes: 'scratch',
    });
    const { container } = renderLibraryMonster(content, {}, { isExpanded: false, isSelected: false });
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });

  it('does not show notes', () => {
    const content = buildMonsterContent({ notes: 'lair is flooded' });
    const { container, queryByText } = renderLibraryMonster(content, {}, { isExpanded: false });
    expect(queryByText('lair is flooded')).toBeNull();
    expect(container.querySelector('.library-card-content-container').style.height).toBe('80px');
  });
});

describe('LibraryMonsterContent - expanded view: rendering', () => {
  it('shows one combined subtitle line', () => {
    const content = buildMonsterContent({ size: 'Huge', creatureType: 'dragon (red)', alignment: 'chaotic evil' });
    const { getByText, container } = renderLibraryMonster(content, {}, { isExpanded: true });
    expect(getByText('Huge dragon (red), chaotic evil')).not.toBeNull();
    expect(container.querySelector('.library-monster-subtitle')).not.toBeNull();
  });

  it('shows AC/HP/Speed as real editable icon-chip inputs', () => {
    const content = buildMonsterContent({ armorClass: '18', hitPoints: '195', speed: '40 ft.' });
    const { getByLabelText, container } = renderLibraryMonster(content, {}, { isExpanded: true });
    expect(getByLabelText('Armor Class').value).toBe('18');
    expect(getByLabelText('Hit Points').value).toBe('195');
    expect(getByLabelText('Speed').value).toBe('40 ft.');
    expect(container.querySelectorAll('.library-monster-defenses input').length).toBe(3);
  });

  it('renders the three top-level groups: Stats, Combat, Notes', () => {
    const { getByText, getByRole } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    expect(getByText('Stats')).not.toBeNull();
    expect(getByText('Combat')).not.toBeNull();
    expect(getByRole('button', { name: /Notes/ })).not.toBeNull();
  });

  it('Notes renders right after the picture/chips row, before Stats and Combat', () => {
    const { getByRole } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    const headers = Array.from(document.querySelectorAll('.monster-section-header, .library-monster-media-top'))
      .map(el => el.className.includes('media-top') ? 'media-top' : el.textContent.replace(/[▾▸]/g, ''));
    const mediaIndex = headers.indexOf('media-top');
    const notesIndex = headers.findIndex(h => h.includes('Notes'));
    const statsIndex = headers.findIndex(h => h === 'Stats');
    expect(mediaIndex).toBeLessThan(notesIndex);
    expect(notesIndex).toBeLessThan(statsIndex);
    expect(getByRole('button', { name: /Notes/ })).not.toBeNull();
  });

  it('HP/AC/Speed sit beside the picture, not stacked below it', () => {
    const content = buildMonsterContent({ armorClass: '18', portrait: 'data:image/jpeg;base64,x' });
    const { container } = renderLibraryMonster(content, {}, { isExpanded: true });
    const mediaTop = container.querySelector('.library-monster-media-top');
    expect(mediaTop.querySelector('.monster-portrait')).not.toBeNull();
    expect(mediaTop.querySelector('.library-monster-defenses')).not.toBeNull();
  });

  it('the subtitle (creature description) sits below the picture/chips row', () => {
    const content = buildMonsterContent({ size: 'Huge', creatureType: 'dragon (red)', alignment: 'chaotic evil' });
    const { container } = renderLibraryMonster(content, {}, { isExpanded: true });
    const rows = Array.from(container.querySelectorAll('.library-monster-media-top, .library-monster-subtitle'));
    expect(rows.map(el => el.className.includes('media-top') ? 'media-top' : 'subtitle')).toEqual(['media-top', 'subtitle']);
  });

  it('the portrait is editable - shows an upload placeholder when empty', () => {
    const { container } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    expect(container.querySelector('.monster-portrait-placeholder')).not.toBeNull();
  });

  it('the portrait shows a clear button when a portrait is set', () => {
    const content = buildMonsterContent({ armorClass: '18', portrait: 'data:image/jpeg;base64,x', portraitAlt: 'A goblin' });
    const { container, getByAltText } = renderLibraryMonster(content, {}, { isExpanded: true });
    expect(getByAltText('A goblin')).not.toBeNull();
    expect(container.querySelector('.monster-portrait-clear')).not.toBeNull();
  });

  it("the Library's Notes label is hidden - the CollapsibleSection header already says \"Notes\"", () => {
    const { container } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    const notesLabel = container.querySelector('.monster-notes .monster-field-label');
    expect(notesLabel.className).toContain('sr-only');
  });

  it('groups default open - nested section fields (e.g. Size) are visible with no collapse override', () => {
    const { getByLabelText, getByText } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    expect(getByLabelText('Size')).not.toBeNull();
    expect(getByText('+ Add text')).not.toBeNull(); // Notes' own content, visible - group isn't collapsed
  });

  it('an empty field still renders (with its placeholder) - editable means visible even when blank', () => {
    const { getByLabelText } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    const sizeInput = getByLabelText('Size');
    expect(sizeInput.value).toBe('');
    expect(sizeInput.placeholder).toBe('Large');
  });

  it('all 6 ability scores render as real inputs, sharing the canvas markup (.monster-ability-cell)', () => {
    const content = buildMonsterContent({ armorClass: '18', str: '18' });
    const { getByLabelText, container } = renderLibraryMonster(content, {}, { isExpanded: true });
    expect(getByLabelText('STR').value).toBe('18');
    expect(getByLabelText('DEX').value).toBe('');
    expect(container.querySelectorAll('.monster-ability-cell').length).toBe(6);
  });
});

describe('LibraryMonsterContent - collapse behavior', () => {
  it('collapsing Combat hides an Actions entry field from the DOM', () => {
    const content = buildMonsterContent({
      armorClass: '18',
      actions: [{ id: 'e1', name: 'Bite', description: '' }],
    });
    const { queryByLabelText } = renderLibraryMonster(content, { combat: true }, { isExpanded: true });
    expect(queryByLabelText('Action 1 name')).toBeNull();
  });

  it('Combat expanded (default) shows the Actions entry field', () => {
    const content = buildMonsterContent({
      armorClass: '18',
      actions: [{ id: 'e1', name: 'Bite', description: '' }],
    });
    const { getByLabelText } = renderLibraryMonster(content, {}, { isExpanded: true });
    expect(getByLabelText('Action 1 name').value).toBe('Bite');
  });

  it('clicking a group header dispatches setMonsterCollapsed with scope: library', () => {
    const { getByText, store } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    fireEvent.click(getByText('Combat'));
    expect(store.dispatched).toContainEqual({
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: true, scope: 'library' },
    });
  });

  it('clicking the Notes header dispatches the library-only "notes" key', () => {
    const { getByRole, store } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true });
    fireEvent.click(getByRole('button', { name: /Notes/ }));
    expect(store.dispatched).toContainEqual({
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'notes', collapsed: true, scope: 'library' },
    });
  });

  it('a nested section (e.g. Creature) collapses independently of its Stats group', () => {
    const content = buildMonsterContent({ armorClass: '18', size: 'Large' });
    const { getByText, queryByLabelText } = renderLibraryMonster(content, { identity: true }, { isExpanded: true });
    expect(getByText('Stats')).not.toBeNull(); // group itself still open
    expect(queryByLabelText('Size')).toBeNull(); // nested Creature section is collapsed
  });

  it('clicking a collapse toggle does not disarm dragging (no setEditingCard call)', () => {
    const setEditingCard = vi.fn();
    const { getByText } = renderLibraryMonster(buildMonsterContent({ armorClass: '18' }), {}, { isExpanded: true, setEditingCard });
    fireEvent.click(getByText('Combat'));
    expect(setEditingCard).not.toHaveBeenCalled();
  });
});

describe('LibraryMonsterContent - editing dispatches (reuses the canvas actions/hooks)', () => {
  it('typing dispatches nothing; blurring dispatches exactly one updateCardMonsterFields', () => {
    const content = buildMonsterContent({ armorClass: '18', creatureType: 'dragon' });
    const { getByLabelText, store } = renderLibraryMonster(content, {}, { isExpanded: true });
    const input = getByLabelText('Type');

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'giant' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(input);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCardMonsterFields', payload: { id: 'c1', fields: { creatureType: 'giant' } } },
    ]);
  });

  it('a click flips readOnly off and calls setEditingCard(true); blur reverses both', () => {
    const setEditingCard = vi.fn();
    const content = buildMonsterContent({ armorClass: '18' });
    const { getByLabelText } = renderLibraryMonster(content, {}, { isExpanded: true, setEditingCard });
    const input = getByLabelText('Armor Class');

    expect(input.readOnly).toBe(true);
    fireEvent.click(input);
    expect(input.readOnly).toBe(false);
    expect(setEditingCard).toHaveBeenCalledWith(true);

    fireEvent.blur(input);
    expect(input.readOnly).toBe(true);
    expect(setEditingCard).toHaveBeenLastCalledWith(false);
  });

  it('an entry name field dispatches updateMonsterEntry on blur', () => {
    const content = buildMonsterContent({ armorClass: '18', actions: [{ id: 'e1', name: 'Scimitar', description: '' }] });
    const { getByLabelText, store } = renderLibraryMonster(content, {}, { isExpanded: true });
    const nameInput = getByLabelText('Action 1 name');

    fireEvent.click(nameInput);
    fireEvent.change(nameInput, { target: { value: 'Longsword' } });
    fireEvent.blur(nameInput);

    expect(store.dispatched).toEqual([{
      type: 'project/updateMonsterEntry',
      payload: { id: 'c1', field: 'actions', entryId: 'e1', changes: { name: 'Longsword' } },
    }]);
  });

  it('+ Add Action dispatches addMonsterEntry (entry CRUD is in scope)', () => {
    const content = buildMonsterContent({ armorClass: '18' });
    const { getByText, store } = renderLibraryMonster(content, {}, { isExpanded: true });

    fireEvent.click(getByText('+ Add Action'));

    expect(store.dispatched).toHaveLength(1);
    expect(store.dispatched[0].type).toBe('project/addMonsterEntry');
    expect(store.dispatched[0].payload).toMatchObject({ id: 'c1', field: 'actions' });
  });

  it('duplicate/delete entry buttons work and do not need setEditingCard (plain clicks)', () => {
    const setEditingCard = vi.fn();
    const content = buildMonsterContent({
      armorClass: '18',
      actions: [{ id: 'e1', name: 'Scimitar', description: '' }],
    });
    const { getByRole, store } = renderLibraryMonster(content, {}, { isExpanded: true, setEditingCard });

    fireEvent.click(getByRole('button', { name: 'Duplicate Action 1' }));
    expect(store.dispatched[0].type).toBe('project/duplicateMonsterEntry');

    fireEvent.click(getByRole('button', { name: 'Delete Action 1' }));
    expect(store.dispatched[1].type).toBe('project/deleteMonsterEntry');

    expect(setEditingCard).not.toHaveBeenCalled();
  });

  it('a notes text block dispatches updateCustomTextBlock (field: notes) on blur, same mechanism as a custom card', () => {
    const content = buildMonsterContent({ armorClass: '18', notes: [{ id: 'n1', type: 'text', text: '' }] });
    const { getByPlaceholderText, store } = renderLibraryMonster(content, {}, { isExpanded: true });
    const notes = getByPlaceholderText('Type anything...');
    const blockId = content.notes[0].id;

    fireEvent.click(notes);
    fireEvent.change(notes, { target: { value: 'lair is flooded' } });
    fireEvent.blur(notes);

    expect(store.dispatched).toEqual([
      { type: 'project/updateCustomTextBlock', payload: { id: 'c1', blockId, text: 'lair is flooded', field: 'notes' } },
    ]);
  });

  it('+ Add text / + Add image in Notes dispatch addCustomBlock with field: notes', () => {
    const content = buildMonsterContent({ armorClass: '18' });
    const { getByText, store } = renderLibraryMonster(content, {}, { isExpanded: true });

    fireEvent.click(getByText('+ Add image'));

    expect(store.dispatched).toHaveLength(1);
    expect(store.dispatched[0]).toMatchObject({
      type: 'project/addCustomBlock',
      payload: { id: 'c1', blockType: 'image', field: 'notes' },
    });
  });
});
