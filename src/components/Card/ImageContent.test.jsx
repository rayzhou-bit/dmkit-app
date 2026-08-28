vi.mock('../../utils/imageUtils', () => ({
  processImageFile: vi.fn(),
}));

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { processImageFile } from '../../utils/imageUtils';
import ImageContent from './ImageContent';

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

const renderImageContent = (content) => {
  const store = makeStore(content);
  const utils = render(<Provider store={store}><ImageContent cardId='c1' /></Provider>);
  return { ...utils, store };
};

describe('ImageContent', () => {
  it('renders an img with the content image/alt when set, not draggable', () => {
    const { container } = renderImageContent({ image: 'data:image/jpeg;base64,xxx', alt: 'cat.png' });
    const img = container.querySelector('.card-image');
    expect(img).not.toBeNull();
    expect(img.src).toBe('data:image/jpeg;base64,xxx');
    expect(img.alt).toBe('cat.png');
    expect(img.getAttribute('draggable')).toBe('false');
  });

  it('renders the placeholder (no img) when content.image is empty', () => {
    const { container } = renderImageContent({ image: '', alt: '' });
    expect(container.querySelector('.card-image')).toBeNull();
    expect(container.querySelector('.image-placeholder')).not.toBeNull();
  });

  it('clicking the placeholder opens the file picker', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { container } = renderImageContent({ image: '', alt: '' });
    fireEvent.click(container.querySelector('.image-placeholder'));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('dispatches updateCardImage on a successful file pick and resets the input value', async () => {
    processImageFile.mockResolvedValueOnce({ image: 'data:image/jpeg;base64,new', alt: 'dog.png' });
    const { container, store } = renderImageContent({ image: '', alt: '' });
    const input = container.querySelector('.card-file-input');
    const file = new File(['x'], 'dog.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    await act(async () => { fireEvent.change(input); });

    expect(store.dispatched).toContainEqual({
      type: 'project/updateCardImage',
      payload: { id: 'c1', image: 'data:image/jpeg;base64,new', alt: 'dog.png' },
    });
    expect(input.value).toBe('');
  });

  it('renders the error message and dispatches nothing when processing rejects', async () => {
    processImageFile.mockRejectedValueOnce(new Error('nope'));
    const { container, store } = renderImageContent({ image: '', alt: '' });
    const input = container.querySelector('.card-file-input');
    const file = new File(['x'], 'dog.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    await act(async () => { fireEvent.change(input); });

    expect(container.querySelector('.image-error').textContent).toContain('nope');
    expect(store.dispatched.some(a => a.type === 'project/updateCardImage')).toBe(false);
  });
});
