import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import LibraryCustomContent from './LibraryCustomContent';
import { buildCustomContent } from '../../constants/custom';

// Hand-rolled fake store, matching the pattern in LibraryNoteContent.test.jsx -
// no collapse state needed here, custom has no collapsible sections.
const makeStore = (content) => {
  const dispatched = [];
  return {
    dispatched,
    getState: () => ({ project: { present: { cards: { c1: { content } } } } }),
    dispatch: (action) => { dispatched.push(action); return action; },
    subscribe: () => () => {},
  };
};

const renderLibraryCustom = (content, props = {}) => {
  const store = makeStore(content);
  const utils = render(
    <Provider store={store}>
      <LibraryCustomContent cardId='c1' isExpanded={false} isSelected={false} setEditingCard={() => {}} {...props} />
    </Provider>
  );
  return { ...utils, store };
};

describe('LibraryCustomContent - empty state', () => {
  it('shows the empty label for fully-empty content', () => {
    const { getByText, container } = renderLibraryCustom(buildCustomContent());
    expect(getByText('No blocks yet')).not.toBeNull();
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });

  it('shows the empty label when blocks exist but are all blank', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: '' }] });
    const { getByText } = renderLibraryCustom(content);
    expect(getByText('No blocks yet')).not.toBeNull();
  });
});

describe('LibraryCustomContent - condensed view (unselected, not expanded)', () => {
  it('is 80px tall and shows the first content-bearing text block as the summary line', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'Some notes.' }] });
    const { container, getByText } = renderLibraryCustom(content);
    const wrapper = container.querySelector('.library-card-content-container');
    expect(wrapper.style.height).toBe('80px');
    expect(getByText('Some notes.')).not.toBeNull();
  });

  it('shows a thumbnail when the first content-bearing block is an image', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'image', image: 'data:image/jpeg;base64,x', alt: 'photo.png' }] });
    const { container } = renderLibraryCustom(content);
    const thumb = container.querySelector('.library-custom-thumb');
    expect(thumb).not.toBeNull();
    expect(thumb.alt).toBe('photo.png');
  });

  it('skips a leading blank block and summarizes the first one with content', () => {
    const content = buildCustomContent({
      blocks: [
        { id: 'b1', type: 'text', text: '' },
        { id: 'b2', type: 'image', image: 'data:image/jpeg;base64,x', alt: 'photo.png' },
      ],
    });
    const { container } = renderLibraryCustom(content);
    expect(container.querySelector('.library-custom-thumb')).not.toBeNull();
  });

  it('renders no input or textarea - stays fully read-only, unlike the expanded view', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'Some notes.' }] });
    const { container } = renderLibraryCustom(content);
    expect(container.querySelector('input')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });
});

describe('LibraryCustomContent - expanded view (selected or isExpanded)', () => {
  it('renders the block list, editable', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'Some notes.' }] });
    const { container, getByPlaceholderText } = renderLibraryCustom(content, { isExpanded: true });
    expect(container.querySelectorAll('.custom-block').length).toBe(1);
    expect(getByPlaceholderText('Type anything...').value).toBe('Some notes.');
  });

  it('shows the two add buttons', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'x' }] });
    const { getByText } = renderLibraryCustom(content, { isExpanded: true });
    expect(getByText('+ Add text')).not.toBeNull();
    expect(getByText('+ Add image')).not.toBeNull();
  });

  it('typing in a text block dispatches nothing; blurring dispatches exactly one updateCustomTextBlock', () => {
    const content = buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: 'Some notes.' }] });
    const { getByPlaceholderText, store } = renderLibraryCustom(content, { isExpanded: true });
    const textarea = getByPlaceholderText('Type anything...');

    fireEvent.change(textarea, { target: { value: 'Updated notes.' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(textarea);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCustomTextBlock', payload: { id: 'c1', blockId: 'b1', text: 'Updated notes.' } },
    ]);
  });
});
