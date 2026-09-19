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
      payload: { id: 'c1', key: 'bonusActions', collapsed: false },
    });
  });

  it('clicking a (default-collapsed) column header dispatches session/setMonsterCollapsed with collapsed:false', () => {
    const content = buildMonsterContent();
    const { getByText, store } = renderMonster(content);

    fireEvent.click(getByText('Combat'));

    expect(store.dispatched).toContainEqual({
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: false },
    });
  });

  it("a collapsed section's fields are absent from the DOM", () => {
    const content = buildMonsterContent({ bonusActions: 'Some bonus action text' });
    const { queryByLabelText } = renderMonster(content, { combat: false }); // column open, section still defaults collapsed
    expect(queryByLabelText('Bonus Actions')).toBeNull();
  });

  it("a collapsed column's fields are absent from the DOM by default", () => {
    const content = buildMonsterContent({ armorClass: '18' });
    const { queryByLabelText } = renderMonster(content); // no override - both columns default collapsed
    expect(queryByLabelText('Armor Class')).toBeNull();
    expect(queryByLabelText('Traits')).toBeNull();
  });

  it('a session override drives isCollapsed: expands a normally-default-collapsed section', () => {
    const content = buildMonsterContent({ bonusActions: 'Some bonus action text' });
    const { getByLabelText } = renderMonster(content, { combat: false, bonusActions: false });
    expect(getByLabelText('Bonus Actions')).not.toBeNull();
  });

  it('a session override expands a column, overriding its default-collapsed state', () => {
    const content = buildMonsterContent({ armorClass: '18' }); // armorClass lives in the attributes column
    const { getByText, getByLabelText } = renderMonster(content, { attributes: false });
    const attributesColumn = getByText('Attributes').closest('.monster-column');
    expect(attributesColumn.className).not.toContain('monster-column-collapsed');
    expect(getByLabelText('Armor Class')).not.toBeNull();
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
      { type: 'session/setMonsterCollapsed', payload: { id: 'c1', key: 'combat', collapsed: false } },
    ]);
  });
});
