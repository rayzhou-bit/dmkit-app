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
    expect(queryByText('Combat')).toBeNull();
  });

  it('renders no input or textarea, condensed or expanded', () => {
    const content = buildMonsterContent({
      creatureType: 'dragon', armorClass: '18', traits: 'Amphibious.', portrait: 'data:image/jpeg;base64,x',
    });
    const condensed = renderLibraryMonster(content, { isExpanded: false });
    expect(condensed.container.querySelector('input')).toBeNull();
    expect(condensed.container.querySelector('textarea')).toBeNull();

    const expanded = renderLibraryMonster(content, { isExpanded: true });
    expect(expanded.container.querySelector('input')).toBeNull();
    expect(expanded.container.querySelector('textarea')).toBeNull();
  });
});
