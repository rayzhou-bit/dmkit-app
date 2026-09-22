import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import CustomContent from './CustomContent';
import { buildCustomContent } from '../../constants/custom';

// Hand-rolled fake store, matching the pattern in NoteContent.test.jsx.
const makeStore = (content) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderCustom = (content) => {
  const store = makeStore(content);
  const utils = render(<Provider store={store}><CustomContent cardId='c1' /></Provider>);
  return { ...utils, store };
};

describe('CustomContent - empty state', () => {
  it('renders no blocks, just the two add buttons', () => {
    const { container, getByText } = renderCustom(buildCustomContent());
    expect(container.querySelectorAll('.custom-block').length).toBe(0);
    expect(getByText('+ Add text')).not.toBeNull();
    expect(getByText('+ Add image')).not.toBeNull();
  });

  it('clicking "+ Add text" dispatches exactly one addCustomBlock with blockType: text', () => {
    const { getByText, store } = renderCustom(buildCustomContent());

    fireEvent.click(getByText('+ Add text'));

    expect(store.dispatched).toHaveLength(1);
    const action = store.dispatched[0];
    expect(action.type).toBe('project/addCustomBlock');
    expect(action.payload.id).toBe('c1');
    expect(action.payload.blockType).toBe('text');
    expect(typeof action.payload.blockId).toBe('string');
    expect(action.payload.blockId.length).toBeGreaterThan(0);
  });

  it('clicking "+ Add image" dispatches exactly one addCustomBlock with blockType: image', () => {
    const { getByText, store } = renderCustom(buildCustomContent());

    fireEvent.click(getByText('+ Add image'));

    expect(store.dispatched).toHaveLength(1);
    expect(store.dispatched[0].payload.blockType).toBe('image');
  });
});

describe('CustomContent - text block', () => {
  const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'Some notes.' }] });

  it('renders a plain textarea with the block value, no name/label field', () => {
    const { container, getByPlaceholderText } = renderCustom(content);
    expect(container.querySelectorAll('.custom-block').length).toBe(1);
    expect(getByPlaceholderText('Type anything...').value).toBe('Some notes.');
  });

  it('typing dispatches nothing; blurring dispatches exactly one updateCustomTextBlock', () => {
    const { getByPlaceholderText, store } = renderCustom(content);
    const textarea = getByPlaceholderText('Type anything...');

    fireEvent.change(textarea, { target: { value: 'Updated notes.' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(textarea);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCustomTextBlock', payload: { id: 'c1', blockId: 'b1', text: 'Updated notes.' } },
    ]);
  });

  it('blur with no net change dispatches nothing (equality guard)', () => {
    const { getByPlaceholderText, store } = renderCustom(content);
    const textarea = getByPlaceholderText('Type anything...');

    fireEvent.change(textarea, { target: { value: 'Something else' } });
    fireEvent.change(textarea, { target: { value: 'Some notes.' } });
    fireEvent.blur(textarea);

    expect(store.dispatched).toHaveLength(0);
  });

  it('Escape reverts without dispatching', () => {
    const { getByPlaceholderText, store } = renderCustom(content);
    const textarea = getByPlaceholderText('Type anything...');

    fireEvent.change(textarea, { target: { value: 'Something else' } });
    fireEvent.keyDown(textarea, { key: 'Escape' });
    expect(textarea.value).toBe('Some notes.');

    fireEvent.blur(textarea);
    expect(store.dispatched).toHaveLength(0);
  });
});

describe('CustomContent - image block', () => {
  const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'image', image: '', alt: '' }] });

  it('renders an upload placeholder for an empty image block', () => {
    const { container } = renderCustom(content);
    expect(container.querySelector('.custom-image-block-placeholder')).not.toBeNull();
  });

  it('placeholder click opens the file picker', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    const { container } = renderCustom(content);
    fireEvent.click(container.querySelector('.custom-image-block-placeholder'));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it('shows the image and a clear button once set', () => {
    const filled = buildCustomContent({ blocks: [{ id: 'b1', type: 'image', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' }] });
    const { container, getByAltText } = renderCustom(filled);
    expect(getByAltText('photo.png')).not.toBeNull();
    expect(container.querySelector('.custom-image-block-clear')).not.toBeNull();
  });

  it('clear button dispatches empty strings via updateCustomImageBlock', () => {
    const filled = buildCustomContent({ blocks: [{ id: 'b1', type: 'image', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' }] });
    const { container, store } = renderCustom(filled);
    fireEvent.click(container.querySelector('.custom-image-block-clear'));

    expect(store.dispatched).toContainEqual({
      type: 'project/updateCustomImageBlock',
      payload: { id: 'c1', blockId: 'b1', image: '', alt: '' },
    });
  });
});

describe('CustomContent - mixed blocks, duplicate/delete', () => {
  const content = buildCustomContent({
    blocks: [
      { id: 'b1', type: 'text', text: 'First.' },
      { id: 'b2', type: 'image', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' },
    ],
  });

  it('renders both a text block and an image block, correctly typed', () => {
    const { container } = renderCustom(content);
    expect(container.querySelectorAll('.custom-block').length).toBe(2);
    expect(container.querySelector('.custom-block:nth-child(1) textarea')).not.toBeNull();
    expect(container.querySelector('.custom-block:nth-child(2) .custom-image-block')).not.toBeNull();
  });

  it('duplicate/delete target only the clicked block, preserving type', () => {
    const { getByRole, store } = renderCustom(content);

    fireEvent.click(getByRole('button', { name: 'Duplicate Block 2' }));
    expect(store.dispatched).toHaveLength(1);
    let action = store.dispatched[0];
    expect(action.type).toBe('project/duplicateCustomBlock');
    expect(action.payload).toMatchObject({ id: 'c1', blockId: 'b2' });
    expect(typeof action.payload.newBlockId).toBe('string');
    expect(action.payload.newBlockId).not.toBe('b2');

    fireEvent.click(getByRole('button', { name: 'Delete Block 1' }));
    expect(store.dispatched).toHaveLength(2);
    action = store.dispatched[1];
    expect(action).toEqual({
      type: 'project/deleteCustomBlock',
      payload: { id: 'c1', blockId: 'b1' },
    });
  });
});
