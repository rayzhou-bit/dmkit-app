import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import MonsterContent from './MonsterContent';
import { buildMonsterContent } from '../../constants/monster';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
const makeStore = (content) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderMonster = (content) => {
  const store = makeStore(content);
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

  it('clicking a collapsed section header dispatches setCardSectionCollapsed with collapsed:false', () => {
    const content = buildMonsterContent(); // bonusActions defaults collapsed:true
    const { getByText, store } = renderMonster(content);

    fireEvent.click(getByText('Bonus Actions'));

    expect(store.dispatched).toContainEqual({
      type: 'project/setCardSectionCollapsed',
      payload: { id: 'c1', section: 'bonusActions', collapsed: false },
    });
  });

  it("a collapsed section's fields are absent from the DOM", () => {
    const content = buildMonsterContent({ bonusActions: 'Some bonus action text' });
    const { queryByLabelText } = renderMonster(content);
    expect(queryByLabelText('Bonus Actions')).toBeNull();
  });

  it('renders with defaults, without throwing, when content.collapsed is entirely absent', () => {
    const content = buildMonsterContent();
    delete content.collapsed;
    expect(() => renderMonster(content)).not.toThrow();
  });
});
