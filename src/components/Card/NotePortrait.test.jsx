vi.mock('../../utils/imageUtils', () => ({
  processImageFile: vi.fn(),
}));

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';

import { processImageFile } from '../../utils/imageUtils';
import { PORTRAIT_MAX_EDGE_STEPS, MAX_PORTRAIT_DATA_URI_LENGTH } from '../../constants/images';
import { usePortraitHooks } from './hooks';
import NotePortrait from './NotePortrait';

// Hand-rolled fake store, matching the pattern in MonsterPortrait.test.jsx -
// NotePortrait shares usePortraitHooks with MonsterPortrait (see
// hooks.js), so this is largely the same coverage retargeted at the
// note-specific view markup (.note-portrait* classes).
const makeStore = (content) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

// The hook lives in the content component (so a drop anywhere on the card
// works) - this stands in for it: hook call, drop handler on the root.
const Harness = () => {
  const hooks = usePortraitHooks({ cardId: 'c1' });
  return (
    <div className='root' onDragOver={(e) => e.preventDefault()} onDrop={hooks.onDrop}>
      <NotePortrait {...hooks} />
    </div>
  );
};

const renderPortrait = (content) => {
  const store = makeStore(content);
  const utils = render(<Provider store={store}><Harness /></Provider>);
  return { ...utils, store };
};

describe('NotePortrait', () => {
  it('with no portrait renders no placeholder and no image, only the hidden file input', () => {
    const { container } = renderPortrait({ portrait: '', portraitAlt: '' });
    expect(container.querySelector('.note-portrait')).toBeNull();
    expect(container.querySelector('.note-portrait-placeholder')).toBeNull();
    expect(container.querySelector('img.note-portrait-image')).toBeNull();
    expect(container.querySelector('.note-portrait-clear')).toBeNull();
    expect(container.querySelector('.card-file-input')).not.toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });

  it('with a portrait renders the image and clear button, and no add button', () => {
    const { container } = renderPortrait({ portrait: 'data:image/jpeg;base64,xxx', portraitAlt: 'map.png' });
    const img = container.querySelector('img.note-portrait-image');
    expect(img.getAttribute('src')).toBe('data:image/jpeg;base64,xxx');
    expect(img.getAttribute('alt')).toBe('map.png');
    expect(container.querySelector('.note-portrait-clear')).not.toBeNull();
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

  it('dispatches updateCardPortrait when a file is dropped on the content root', async () => {
    processImageFile.mockResolvedValueOnce({ image: 'data:image/jpeg;base64,dropped', alt: 'dropped.png' });
    const { container, store } = renderPortrait({ portrait: '', portraitAlt: '' });
    const file = new File(['x'], 'dropped.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.drop(container.querySelector('.root'), { dataTransfer: { files: [file] } });
    });

    expect(store.dispatched).toContainEqual({
      type: 'project/updateCardPortrait',
      payload: { id: 'c1', portrait: 'data:image/jpeg;base64,dropped', portraitAlt: 'dropped.png' },
    });
  });

  it('renders the error and dispatches nothing when processing rejects', async () => {
    processImageFile.mockRejectedValueOnce(new Error('nope'));
    const { container, store } = renderPortrait({ portrait: '', portraitAlt: '' });
    const input = container.querySelector('.card-file-input');
    const file = new File(['x'], 'map.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });

    await act(async () => { fireEvent.change(input); });

    expect(container.querySelector('.note-portrait-error').textContent).toContain('nope');
    expect(store.dispatched.some(a => a.type === 'project/updateCardPortrait')).toBe(false);
  });

  it('clear button dispatches empty strings', () => {
    const { container, store } = renderPortrait({ portrait: 'data:image/jpeg;base64,xxx', portraitAlt: 'map.png' });
    fireEvent.click(container.querySelector('.note-portrait-clear'));

    expect(store.dispatched).toContainEqual({
      type: 'project/updateCardPortrait',
      payload: { id: 'c1', portrait: '', portraitAlt: '' },
    });
  });

  it('clearing the portrait returns the card to the no-image state', () => {
    // Live store (unlike makeStore) so the dispatched clear actually changes state.
    let content = { portrait: 'data:image/jpeg;base64,xxx', portraitAlt: 'map.png' };
    const listeners = new Set();
    const store = {
      getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
      dispatch: (action) => {
        if (action.type === 'project/updateCardPortrait') {
          content = { portrait: action.payload.portrait, portraitAlt: action.payload.portraitAlt };
          listeners.forEach(l => l());
        }
        return action;
      },
      subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
    };
    const { container } = render(<Provider store={store}><Harness /></Provider>);
    expect(container.querySelector('.note-portrait-image')).not.toBeNull();

    act(() => { fireEvent.click(container.querySelector('.note-portrait-clear')); });

    expect(container.querySelector('.note-portrait')).toBeNull();
    expect(container.querySelector('.note-portrait-image')).toBeNull();
    expect(container.querySelector('.card-file-input')).not.toBeNull();
  });
});
