vi.mock('../../utils/imageUtils', () => ({
  processImageFile: vi.fn(),
}));

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { processImageFile } from '../../utils/imageUtils';
import { PORTRAIT_MAX_EDGE_STEPS, MAX_PORTRAIT_DATA_URI_LENGTH } from '../../constants/images';
import LocationPortrait from './LocationPortrait';

// Hand-rolled fake store, matching the pattern in MonsterPortrait.test.jsx -
// LocationPortrait shares usePortraitHooks with MonsterPortrait (see
// hooks.js), so this is largely the same coverage retargeted at the
// location-specific view markup (.location-portrait* classes).
const makeStore = (content) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderPortrait = (content) => {
  const store = makeStore(content);
  const utils = render(<Provider store={store}><LocationPortrait cardId='c1' /></Provider>);
  return { ...utils, store };
};

describe('LocationPortrait', () => {
  it('placeholder click opens the file picker', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { container } = renderPortrait({ portrait: '', portraitAlt: '' });
    fireEvent.click(container.querySelector('.location-portrait-placeholder'));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('dispatches updateCardPortrait on a successful pick, resets the input value, uses the portrait budget', async () => {
    processImageFile.mockResolvedValueOnce({ image: 'data:image/jpeg;base64,new', alt: 'map.png' });
    const { container, store } = renderPortrait({ portrait: '', portraitAlt: '' });
    const input = container.querySelector('.card-file-input');
    const file = new File(['x'], 'map.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    await act(async () => { fireEvent.change(input); });

    expect(store.dispatched).toContainEqual({
      type: 'project/updateCardPortrait',
      payload: { id: 'c1', portrait: 'data:image/jpeg;base64,new', portraitAlt: 'map.png' },
    });
    expect(input.value).toBe('');
    expect(processImageFile).toHaveBeenCalledWith(file, {
      maxEdgeSteps: PORTRAIT_MAX_EDGE_STEPS,
      maxLength: MAX_PORTRAIT_DATA_URI_LENGTH,
    });
  });

  it('renders the error and dispatches nothing when processing rejects', async () => {
    processImageFile.mockRejectedValueOnce(new Error('nope'));
    const { container, store } = renderPortrait({ portrait: '', portraitAlt: '' });
    const input = container.querySelector('.card-file-input');
    const file = new File(['x'], 'map.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    await act(async () => { fireEvent.change(input); });

    expect(container.querySelector('.location-portrait-error').textContent).toContain('nope');
    expect(store.dispatched.some(a => a.type === 'project/updateCardPortrait')).toBe(false);
  });

  it('clear button dispatches empty strings', () => {
    const { container, store } = renderPortrait({ portrait: 'data:image/jpeg;base64,xxx', portraitAlt: 'map.png' });
    fireEvent.click(container.querySelector('.location-portrait-clear'));

    expect(store.dispatched).toContainEqual({
      type: 'project/updateCardPortrait',
      payload: { id: 'c1', portrait: '', portraitAlt: '' },
    });
  });
});
