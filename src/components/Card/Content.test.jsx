import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import Content from './Content';

// Hand-rolled fake store, matching the pattern in Canvas/testUtils.jsx.
const makeStore = (cards) => ({
  getState: () => ({ project: { present: { cards } } }),
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
});
