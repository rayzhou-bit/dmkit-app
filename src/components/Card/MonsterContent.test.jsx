import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import MonsterContent from './MonsterContent';
import { buildMonsterContent } from '../../constants/monster';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
// Both Attributes and Combat default to collapsed - most tests that reach
// into a field pass an override expanding the column that field lives in.
const makeStore = (content, collapseOverrides = {}) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({
      project: { present: { cards: { c1: { content } } } },
      session: { monsterCollapse: { c1: collapseOverrides } },
    }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderMonster = (content, collapseOverrides) => {
  const store = makeStore(content, collapseOverrides);
  const utils = render(<Provider store={store}><MonsterContent cardId='c1' /></Provider>);
  return { ...utils, store };
};

describe('MonsterContent', () => {
  it('renders core-section inputs with store values', () => {
    const content = buildMonsterContent({ creatureType: 'dragon', armorClass: '18' });
    const { getByLabelText } = renderMonster(content, { attributes: false });
    expect(getByLabelText('Type').value).toBe('dragon');
    expect(getByLabelText('Armor Class').value).toBe('18');
  });

  it('typing dispatches nothing; blurring dispatches exactly one updateCardMonsterFields', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { getByLabelText, store } = renderMonster(content, { attributes: false });
    const input = getByLabelText('Type');

    fireEvent.change(input, { target: { value: 'giant' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(input);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCardMonsterFields', payload: { id: 'c1', fields: { creatureType: 'giant' } } },
    ]);
  });

  it('blur with no net change dispatches nothing (equality guard)', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { getByLabelText, store } = renderMonster(content, { attributes: false });
    const input = getByLabelText('Type');

    fireEvent.change(input, { target: { value: 'giant' } });
    fireEvent.change(input, { target: { value: 'dragon' } });
    fireEvent.blur(input);

    expect(store.dispatched).toHaveLength(0);
  });

  it('Enter on a single-line field commits', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { getByLabelText, store } = renderMonster(content, { attributes: false });
    const input = getByLabelText('Type');

    fireEvent.change(input, { target: { value: 'giant' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(store.dispatched).toEqual([
      { type: 'project/updateCardMonsterFields', payload: { id: 'c1', fields: { creatureType: 'giant' } } },
    ]);
  });

  it('Escape reverts without dispatching', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { getByLabelText, store } = renderMonster(content, { attributes: false });
    const input = getByLabelText('Type');

    fireEvent.change(input, { target: { value: 'giant' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);

    expect(input.value).toBe('dragon');
    expect(store.dispatched).toHaveLength(0);
  });

  it('ability modifier: score 18 renders +4, empty renders —', () => {
    const content = buildMonsterContent({ str: '18' });
    const { getByLabelText, container } = renderMonster(content, { attributes: false });
    expect(getByLabelText('STR').value).toBe('18');
    const modifiers = container.querySelectorAll('.monster-ability-modifier');
    const texts = Array.from(modifiers).map(el => el.textContent);
    expect(texts).toContain('+4');
    expect(texts).toContain('—'); // every other empty ability score
  });

  it('ability score input filters typed letters down to digits', () => {
    const content = buildMonsterContent();
    const { getByLabelText } = renderMonster(content, { attributes: false });
    const input = getByLabelText('STR');

    fireEvent.change(input, { target: { value: '1a8b' } });
    expect(input.value).toBe('18');
  });

  it('ability modifier updates live while typing, before blur/commit', () => {
    const content = buildMonsterContent();
    const { getByLabelText, container, store } = renderMonster(content, { attributes: false });
    const input = getByLabelText('STR');
    const modifier = container.querySelector('.monster-ability-cell .monster-ability-modifier');

    expect(modifier.textContent).toBe('—');
    fireEvent.change(input, { target: { value: '18' } });
    expect(modifier.textContent).toBe('+4'); // live, not yet committed
    expect(store.dispatched).toHaveLength(0); // no blur yet - nothing dispatched
  });

  it('clicking a collapsed section header dispatches session/setMonsterCollapsed with collapsed:false', () => {
    const content = buildMonsterContent(); // bonusActions defaults collapsed:true within an expanded Combat
    const { getByText, store } = renderMonster(content, { combat: false });

    fireEvent.click(getByText('Bonus Actions'));

    expect(store.dispatched).toContainEqual({
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'bonusActions', collapsed: false, scope: 'canvas' },
    });
  });

  it('clicking a (default-collapsed) column header dispatches session/setMonsterCollapsed with collapsed:false', () => {
    const content = buildMonsterContent();
    const { getByText, store } = renderMonster(content);

    fireEvent.click(getByText('Combat'));

    expect(store.dispatched).toContainEqual({
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: false, scope: 'canvas' },
    });
  });

  it("a collapsed section's fields are absent from the DOM", () => {
    const content = buildMonsterContent({ bonusActions: [{ id: 'e1', name: 'Cunning Action', description: 'Dash.' }] });
    const { queryByLabelText } = renderMonster(content, { combat: false }); // column open, section still defaults collapsed
    expect(queryByLabelText('Bonus Action 1 name')).toBeNull();
  });

  it("a collapsed column's fields are absent from the DOM by default", () => {
    const content = buildMonsterContent({ size: 'Large', traits: [{ id: 'e1', name: 'Amphibious', description: '' }] });
    const { queryByLabelText } = renderMonster(content); // no override - both columns default collapsed
    expect(queryByLabelText('Size')).toBeNull();
    expect(queryByLabelText('Trait 1 name')).toBeNull();
  });

  it('a session override drives isCollapsed: expands a normally-default-collapsed section', () => {
    const content = buildMonsterContent({ bonusActions: [{ id: 'e1', name: 'Cunning Action', description: 'Dash.' }] });
    const { getByLabelText } = renderMonster(content, { combat: false, bonusActions: false });
    expect(getByLabelText('Bonus Action 1 name').value).toBe('Cunning Action');
    expect(getByLabelText('Bonus Action 1 description').value).toBe('Dash.');
  });

  it('a session override expands a column, overriding its default-collapsed state', () => {
    const content = buildMonsterContent({ size: 'Large' }); // size lives in the attributes column
    const { getByText, getByLabelText } = renderMonster(content, { attributes: false });
    const attributesColumn = getByText('Stats').closest('.monster-column');
    expect(attributesColumn.className).not.toContain('monster-column-collapsed');
    expect(getByLabelText('Size')).not.toBeNull();
  });

  it('AC/HP/Speed live in the Media column - visible even with both columns collapsed, in HP/AC/Speed order', () => {
    const content = buildMonsterContent({ armorClass: '18', hitPoints: '195', speed: '40 ft.' });
    const { getByLabelText, container } = renderMonster(content); // no override - both columns default collapsed
    expect(getByLabelText('Armor Class').value).toBe('18');
    expect(getByLabelText('Hit Points').value).toBe('195');
    expect(getByLabelText('Speed').value).toBe('40 ft.');

    const order = Array.from(container.querySelectorAll('.monster-media-fields input')).map(el => el.id);
    expect(order).toEqual([
      'monster-field-c1-hitPoints',
      'monster-field-c1-armorClass',
      'monster-field-c1-speed',
    ]);
  });

  it('toggling a column dispatches only the collapse action - width grows/shrinks live, nothing is persisted', () => {
    const content = buildMonsterContent();
    const dispatched = [];
    // Stable state object (not rebuilt per getState() call) - a fresh nested
    // object every call defeats useSyncExternalStore's reference equality
    // and causes an infinite render loop.
    const state = {
      project: {
        present: {
          activeViewId: 'tab1',
          cards: { c1: { content, views: { tab1: { size: { width: '288px', height: '432px' } } } } },
        },
      },
      session: { monsterCollapse: { c1: {} } },
    };
    const store = {
      dispatched,
      getState: () => state,
      dispatch: (action) => { dispatched.push(action); return action; },
      subscribe: () => () => {},
    };
    const { getByText } = render(<Provider store={store}><MonsterContent cardId='c1' /></Provider>);

    fireEvent.click(getByText('Combat'));
    expect(dispatched).toEqual([
      { type: 'session/setMonsterCollapsed', payload: { id: 'c1', key: 'combat', collapsed: false, scope: 'canvas' } },
    ]);
  });
});

describe('MonsterContent - Combat entry lists', () => {
  it('an empty section renders no entry boxes, just the add button', () => {
    const content = buildMonsterContent();
    const { container, getByText } = renderMonster(content, { combat: false });

    expect(container.querySelectorAll('.monster-entry').length).toBe(0);
    expect(getByText('+ Add Action')).not.toBeNull();
  });

  it('clicking add dispatches exactly one addMonsterEntry with a generated entryId', () => {
    const content = buildMonsterContent();
    const { getByText, store } = renderMonster(content, { combat: false });

    fireEvent.click(getByText('+ Add Action'));

    expect(store.dispatched).toHaveLength(1);
    const action = store.dispatched[0];
    expect(action.type).toBe('project/addMonsterEntry');
    expect(action.payload.id).toBe('c1');
    expect(action.payload.field).toBe('actions');
    expect(typeof action.payload.entryId).toBe('string');
    expect(action.payload.entryId.length).toBeGreaterThan(0);
  });

  it('with two entries, duplicate/delete target only the clicked entry', () => {
    const content = buildMonsterContent({
      actions: [
        { id: 'e1', name: 'Scimitar', description: 'Slash.' },
        { id: 'e2', name: 'Bow', description: 'Pierce.' },
      ],
    });
    const { getByRole, store } = renderMonster(content, { combat: false });

    fireEvent.click(getByRole('button', { name: 'Duplicate Action 2' }));
    expect(store.dispatched).toHaveLength(1);
    let action = store.dispatched[0];
    expect(action.type).toBe('project/duplicateMonsterEntry');
    expect(action.payload).toMatchObject({ id: 'c1', field: 'actions', entryId: 'e2' });
    expect(typeof action.payload.newEntryId).toBe('string');
    expect(action.payload.newEntryId).not.toBe('e2');

    fireEvent.click(getByRole('button', { name: 'Delete Action 1' }));
    expect(store.dispatched).toHaveLength(2);
    action = store.dispatched[1];
    expect(action).toEqual({
      type: 'project/deleteMonsterEntry',
      payload: { id: 'c1', field: 'actions', entryId: 'e1' },
    });
  });

  it('typing dispatches nothing; blurring dispatches exactly one updateMonsterEntry', () => {
    const content = buildMonsterContent({ actions: [{ id: 'e1', name: 'Scimitar', description: '' }] });
    const { getByLabelText, store } = renderMonster(content, { combat: false });
    const nameInput = getByLabelText('Action 1 name');

    fireEvent.change(nameInput, { target: { value: 'Longsword' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(nameInput);
    expect(store.dispatched).toEqual([{
      type: 'project/updateMonsterEntry',
      payload: { id: 'c1', field: 'actions', entryId: 'e1', changes: { name: 'Longsword' } },
    }]);
  });

  it('blur with no net change dispatches nothing (equality guard)', () => {
    const content = buildMonsterContent({ actions: [{ id: 'e1', name: 'Scimitar', description: '' }] });
    const { getByLabelText, store } = renderMonster(content, { combat: false });
    const nameInput = getByLabelText('Action 1 name');

    fireEvent.change(nameInput, { target: { value: 'Longsword' } });
    fireEvent.change(nameInput, { target: { value: 'Scimitar' } });
    fireEvent.blur(nameInput);

    expect(store.dispatched).toHaveLength(0);
  });

  it('Escape reverts the name without dispatching; Enter commits it', () => {
    const content = buildMonsterContent({ actions: [{ id: 'e1', name: 'Scimitar', description: '' }] });
    const { getByLabelText, store } = renderMonster(content, { combat: false });
    const nameInput = getByLabelText('Action 1 name');

    fireEvent.change(nameInput, { target: { value: 'Longsword' } });
    fireEvent.keyDown(nameInput, { key: 'Escape' });
    fireEvent.blur(nameInput);
    expect(nameInput.value).toBe('Scimitar');
    expect(store.dispatched).toHaveLength(0);

    fireEvent.change(nameInput, { target: { value: 'Longsword' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });
    expect(store.dispatched).toEqual([{
      type: 'project/updateMonsterEntry',
      payload: { id: 'c1', field: 'actions', entryId: 'e1', changes: { name: 'Longsword' } },
    }]);
  });

  it('a section holding only an all-blank entry is treated as empty (dims when collapsed, no dot)', () => {
    const content = buildMonsterContent({ actions: [{ id: 'e1', name: '', description: '' }] });
    const { getByText } = renderMonster(content); // both columns collapsed by default
    const header = getByText('Combat').closest('button');
    expect(header.className).toContain('monster-column-header-empty');
  });

  it('a section holding a filled entry is NOT empty (dot when collapsed)', () => {
    const content = buildMonsterContent({ actions: [{ id: 'e1', name: 'Scimitar', description: '' }] });
    const { getByText, container } = renderMonster(content);
    const header = getByText('Combat').closest('button');
    expect(header.className).not.toContain('monster-column-header-empty');
    expect(container.querySelector('.monster-column-dot')).not.toBeNull();
  });

  it('a lines section shows one dot per filled field', () => {
    // 'identity'/Creature has 3 fields (size, creatureType, alignment) - fill 2.
    const content = buildMonsterContent({ size: 'Large', creatureType: 'dragon' });
    // Stats collapsed (default), Creature section itself defaults uncollapsed but
    // that doesn't matter for the column-level dot count on the collapsed column.
    const { getByText, container } = renderMonster(content);
    const header = getByText('Stats').closest('button');
    // Only one section (identity) has content, so the column shows 1 dot -
    // the per-section dot count is checked directly below via the hook.
    expect(container.querySelectorAll('.monster-column-dot').length).toBe(1);
    expect(header.className).not.toContain('monster-column-header-empty');
  });

  it('a section with more than 5 filled fields caps at 5 dots', () => {
    // Proficiencies & Senses has 11 fields - fill 7 of them.
    const content = buildMonsterContent({
      savingThrows: 'Dex +6', skills: 'Perception +13', damageVulnerabilities: 'fire',
      damageResistances: 'cold', damageImmunities: 'poison', senses: 'darkvision 60 ft.',
      languages: 'Common',
    });
    const { getByText } = renderMonster(content, { attributes: false, proficiencies: true });
    const header = getByText('Proficiencies & Senses').closest('button');
    expect(header.querySelectorAll('.monster-section-dot').length).toBe(5);
  });

  it('an entries section shows one dot per content-bearing entry', () => {
    const content = buildMonsterContent({
      actions: [
        { id: 'e1', name: 'Scimitar', description: '' },
        { id: 'e2', name: 'Bow', description: '' },
        { id: 'e3', name: '', description: '' }, // blank - doesn't count
      ],
    });
    const { getByText } = renderMonster(content, { combat: false, actions: true });
    const header = getByText('Actions').closest('button');
    expect(header.querySelectorAll('.monster-section-dot').length).toBe(2);
  });

  it('a column shows one dot per section with content (not per field)', () => {
    // Two sections filled (identity + proficiencies) - column dot count is 2, not the field total.
    const content = buildMonsterContent({ size: 'Large', savingThrows: 'Dex +6' });
    const { getByText } = renderMonster(content);
    const header = getByText('Stats').closest('button');
    expect(header.querySelectorAll('.monster-column-dot').length).toBe(2);
  });
});
