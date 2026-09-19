import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import LibraryMonsterContent from './LibraryMonsterContent';
import { buildMonsterContent } from '../../constants/monster';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
const makeStore = (content) => ({
  getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
  dispatch: () => {},
  subscribe: () => () => {},
});

const renderLibraryMonster = (content, props = {}) => render(
  <Provider store={makeStore(content)}>
    <LibraryMonsterContent cardId='c1' isExpanded={false} isSelected={false} {...props} />
  </Provider>
);

describe('LibraryMonsterContent', () => {
  it('shows the empty label for fully-empty content', () => {
    const { getByText, container } = renderLibraryMonster(buildMonsterContent());
    expect(getByText('No stat block yet')).not.toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });

  it('condensed view is 80px tall and shows filled fields, omitting empty ones', () => {
    const content = buildMonsterContent({ size: 'Large', creatureType: 'dragon', armorClass: '18' });
    const { container, getByText } = renderLibraryMonster(content);
    const wrapper = container.querySelector('.library-card-content-container');
    expect(wrapper.style.height).toBe('80px');
    expect(getByText('Large dragon')).not.toBeNull();
    expect(getByText('AC 18')).not.toBeNull();
  });

  it('expanded view is 280px tall and renders non-empty sections/fields', () => {
    const content = buildMonsterContent({ creatureType: 'dragon', traits: 'Amphibious.' });
    const { container, getByText } = renderLibraryMonster(content, { isExpanded: true });
    const wrapper = container.querySelector('.library-card-content-container');
    expect(wrapper.style.height).toBe('280px');
    expect(getByText('dragon')).not.toBeNull();
    expect(getByText('Amphibious.')).not.toBeNull();
  });

  it('expanded view omits sections that are entirely empty', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { queryByText } = renderLibraryMonster(content, { isExpanded: true });
    expect(queryByText('Traits')).toBeNull();
    expect(queryByText('Defenses')).toBeNull();
  });

  it('renders no input or textarea, condensed or expanded', () => {
    const content = buildMonsterContent({
      creatureType: 'dragon', armorClass: '18', traits: 'Amphibious.', portrait: 'data:image/jpeg;base64,x', notes: 'scratch',
    });
    const condensed = renderLibraryMonster(content, { isExpanded: false });
    expect(condensed.container.querySelector('input')).toBeNull();
    expect(condensed.container.querySelector('textarea')).toBeNull();

    const expanded = renderLibraryMonster(content, { isExpanded: true });
    expect(expanded.container.querySelector('input')).toBeNull();
    expect(expanded.container.querySelector('textarea')).toBeNull();
  });

  it('surfaces notes in the expanded view', () => {
    const content = buildMonsterContent({ notes: 'lair is flooded' });
    const { getByText } = renderLibraryMonster(content, { isExpanded: true });
    expect(getByText('Quick Notes')).not.toBeNull();
    expect(getByText('lair is flooded')).not.toBeNull();
  });

  it.each([[''], ['   ']])('omits the notes block when notes are %j', (notes) => {
    const content = buildMonsterContent({ notes });
    const { queryByText } = renderLibraryMonster(content, { isExpanded: true });
    expect(queryByText('Quick Notes')).toBeNull();
  });

  it('expanded view renders an entry-list section\'s name and description', () => {
    const content = buildMonsterContent({
      actions: [{ id: 'e1', name: 'Scimitar', description: 'Melee Weapon Attack: +7 to hit.' }],
    });
    const { getByText } = renderLibraryMonster(content, { isExpanded: true });
    expect(getByText('Actions')).not.toBeNull();
    expect(getByText('Scimitar')).not.toBeNull();
    expect(getByText('Melee Weapon Attack: +7 to hit.')).not.toBeNull();
  });

  it('expanded view omits an entry-list section whose only entry is all-blank', () => {
    const content = buildMonsterContent({ actions: [{ id: 'e1', name: '', description: '' }] });
    const { queryByText } = renderLibraryMonster(content, { isExpanded: true });
    expect(queryByText('Actions')).toBeNull();
  });

  it('expanded view shows one combined subtitle line, not a separate Creature section', () => {
    const content = buildMonsterContent({ size: 'Huge', creatureType: 'dragon (red)', alignment: 'chaotic evil' });
    const { getByText, queryByText, container } = renderLibraryMonster(content, { isExpanded: true });
    expect(getByText('Huge dragon (red), chaotic evil')).not.toBeNull();
    expect(queryByText('Creature')).toBeNull();
    expect(queryByText('Size')).toBeNull();
    expect(container.querySelector('.library-monster-subtitle')).not.toBeNull();
  });

  it('expanded view shows AC/HP/Speed as icon chips, not label:value lines', () => {
    const content = buildMonsterContent({ armorClass: '18', hitPoints: '195', speed: '40 ft.' });
    const { container, getByText, queryByText } = renderLibraryMonster(content, { isExpanded: true });
    const chips = container.querySelectorAll('.library-monster-defense-chip');
    expect(chips.length).toBe(3);
    expect(getByText('18')).not.toBeNull();
    expect(getByText('195')).not.toBeNull();
    expect(getByText('40 ft.')).not.toBeNull();
    // no leftover "Armor Class"/"Hit Points" text labels (those are icon+value chips now)
    expect(queryByText('Armor Class')).toBeNull();
    expect(queryByText('Hit Points')).toBeNull();
  });

  it('expanded view omits the defenses row entirely when AC/HP/Speed are all blank', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { container } = renderLibraryMonster(content, { isExpanded: true });
    expect(container.querySelector('.library-monster-defenses')).toBeNull();
  });

  it('expanded view shows all 6 ability scores as a grid when any is filled, blanks as —', () => {
    const content = buildMonsterContent({ str: '18', dex: '14' });
    const { container, getByText } = renderLibraryMonster(content, { isExpanded: true });
    const abilities = container.querySelectorAll('.library-monster-ability');
    expect(abilities.length).toBe(6);
    expect(getByText('18')).not.toBeNull();
    expect(getByText('+4')).not.toBeNull(); // STR 18 modifier
    const blankScores = container.querySelectorAll('.library-monster-ability-score');
    expect(Array.from(blankScores).filter(el => el.textContent === '—').length).toBe(4);
  });

  it('expanded view omits the ability score grid when all 6 are blank', () => {
    const content = buildMonsterContent({ creatureType: 'dragon' });
    const { queryByText } = renderLibraryMonster(content, { isExpanded: true });
    expect(queryByText('Ability Scores')).toBeNull();
  });

  it('condensed view does not show notes', () => {
    const content = buildMonsterContent({ notes: 'lair is flooded' });
    const { container, queryByText } = renderLibraryMonster(content, { isExpanded: false });
    expect(queryByText('lair is flooded')).toBeNull();
    expect(container.querySelector('.library-card-content-container').style.height).toBe('80px');
  });
});
