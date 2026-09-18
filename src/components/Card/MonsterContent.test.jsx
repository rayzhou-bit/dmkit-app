import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import MonsterContent from './MonsterContent';
import { buildMonsterContent } from '../../constants/monster';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
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
    const { getByLabelText } = renderMonster(content);
    expect(getByLabelText('Type').value).toBe('dragon');
    expect(getByLabelText('Armor Class').value).toBe('18');
  });

  it('typing dispatches nothing; blurring dispatches exactly one updateCardMonsterFields', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { getByLabelText, store } = renderMonster(content);
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
    const { getByLabelText, store } = renderMonster(content);
    const input = getByLabelText('Type');

    fireEvent.change(input, { target: { value: 'giant' } });
    fireEvent.change(input, { target: { value: 'dragon' } });
    fireEvent.blur(input);

    expect(store.dispatched).toHaveLength(0);
  });

  it('Enter on a single-line field commits', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { getByLabelText, store } = renderMonster(content);
    const input = getByLabelText('Type');

    fireEvent.change(input, { target: { value: 'giant' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(store.dispatched).toEqual([
      { type: 'project/updateCardMonsterFields', payload: { id: 'c1', fields: { creatureType: 'giant' } } },
    ]);
  });

  it('Escape reverts without dispatching', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { getByLabelText, store } = renderMonster(content);
    const input = getByLabelText('Type');

    fireEvent.change(input, { target: { value: 'giant' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.blur(input);

    expect(input.value).toBe('dragon');
    expect(store.dispatched).toHaveLength(0);
  });

  it('ability modifier: score 18 renders +4, empty renders —', () => {
    const content = buildMonsterContent({ str: '18' });
    const { getByLabelText, container } = renderMonster(content);
    expect(getByLabelText('STR').value).toBe('18');
    const modifiers = container.querySelectorAll('.monster-ability-modifier');
    const texts = Array.from(modifiers).map(el => el.textContent);
    expect(texts).toContain('+4');
    expect(texts).toContain('—'); // every other empty ability score
  });

  it('ability score input filters typed letters down to digits', () => {
    const content = buildMonsterContent();
    const { getByLabelText } = renderMonster(content);
    const input = getByLabelText('STR');

    fireEvent.change(input, { target: { value: '1a8b' } });
    expect(input.value).toBe('18');
  });

  it('ability modifier updates live while typing, before blur/commit', () => {
    const content = buildMonsterContent();
    const { getByLabelText, container, store } = renderMonster(content);
    const input = getByLabelText('STR');
    const modifier = container.querySelector('.monster-ability-cell .monster-ability-modifier');

    expect(modifier.textContent).toBe('—');
    fireEvent.change(input, { target: { value: '18' } });
    expect(modifier.textContent).toBe('+4'); // live, not yet committed
    expect(store.dispatched).toHaveLength(0); // no blur yet - nothing dispatched
  });

  it('clicking a collapsed section header dispatches session/setMonsterCollapsed with collapsed:false', () => {
    const content = buildMonsterContent(); // bonusActions defaults collapsed:true
    const { getByText, store } = renderMonster(content);

    fireEvent.click(getByText('Bonus Actions'));

    expect(store.dispatched).toContainEqual({
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'bonusActions', collapsed: false },
    });
  });

  it('clicking a column header dispatches session/setMonsterCollapsed with the column key', () => {
    const content = buildMonsterContent();
    const { getByText, store } = renderMonster(content);

    fireEvent.click(getByText('Combat'));

    expect(store.dispatched).toContainEqual({
      type: 'session/setMonsterCollapsed',
      payload: { id: 'c1', key: 'combat', collapsed: true },
    });
  });

  it("a collapsed section's fields are absent from the DOM", () => {
    const content = buildMonsterContent({ bonusActions: 'Some bonus action text' });
    const { queryByLabelText } = renderMonster(content);
    expect(queryByLabelText('Bonus Actions')).toBeNull();
  });

  it('a session override drives isCollapsed: expands a normally-default-collapsed section', () => {
    const content = buildMonsterContent({ bonusActions: 'Some bonus action text' }); // defaults collapsed:true
    const { getByLabelText } = renderMonster(content, { bonusActions: false });
    expect(getByLabelText('Bonus Actions')).not.toBeNull();
  });

  it('a session override collapses a column and the DOM reflects it', () => {
    const content = buildMonsterContent({ armorClass: '18' }); // armorClass lives in the attributes column
    const { container, queryByLabelText } = renderMonster(content, { attributes: true });
    expect(container.querySelector('.monster-column-collapsed')).not.toBeNull();
    expect(queryByLabelText('Armor Class')).toBeNull();
  });
});
