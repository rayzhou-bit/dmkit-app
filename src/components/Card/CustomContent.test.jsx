vi.mock('../../utils/imageUtils', () => ({
  processImageFile: vi.fn(),
}));

import React from 'react';
import { render, fireEvent, act, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { processImageFile } from '../../utils/imageUtils';
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

  // A block starts in display mode (not editing) - clicking its rendered
  // text swaps in the real textarea (see CardRefField). jsdom has neither
  // caretPositionFromPoint nor caretRangeFromPoint, so the caret always
  // falls back to end-of-text here; real caret placement is a Playwright
  // concern, not a unit-test one.
  const enterEdit = (getByText) => fireEvent.mouseDown(getByText('Some notes.'));

  it('renders the block value inline, no name/label field, no textarea yet', () => {
    const { container, getByText } = renderCustom(content);
    expect(container.querySelectorAll('.custom-block').length).toBe(1);
    expect(getByText('Some notes.')).not.toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
  });

  it('clicking the display swaps in the real textarea with the same value', () => {
    const { getByText, getByPlaceholderText } = renderCustom(content);
    enterEdit(getByText);
    expect(getByPlaceholderText('Type anything...').value).toBe('Some notes.');
  });

  it('typing dispatches nothing; blurring dispatches exactly one updateCustomTextBlock', () => {
    const { getByText, getByPlaceholderText, store } = renderCustom(content);
    enterEdit(getByText);
    const textarea = getByPlaceholderText('Type anything...');

    fireEvent.change(textarea, { target: { value: 'Updated notes.' } });
    expect(store.dispatched).toHaveLength(0);

    fireEvent.blur(textarea);
    expect(store.dispatched).toEqual([
      { type: 'project/updateCustomTextBlock', payload: { id: 'c1', blockId: 'b1', text: 'Updated notes.' } },
    ]);
  });

  it('blur with no net change dispatches nothing (equality guard)', () => {
    const { getByText, getByPlaceholderText, store } = renderCustom(content);
    enterEdit(getByText);
    const textarea = getByPlaceholderText('Type anything...');

    fireEvent.change(textarea, { target: { value: 'Something else' } });
    fireEvent.change(textarea, { target: { value: 'Some notes.' } });
    fireEvent.blur(textarea);

    expect(store.dispatched).toHaveLength(0);
  });

  it('Escape reverts without dispatching', () => {
    const { getByText, getByPlaceholderText, store } = renderCustom(content);
    enterEdit(getByText);
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

  it('shows the image and a centered remove-image button once set', () => {
    const filled = buildCustomContent({ blocks: [{ id: 'b1', type: 'image', image: 'data:image/jpeg;base64,xxx', alt: 'photo.png' }] });
    const { container, getByAltText } = renderCustom(filled);
    expect(getByAltText('photo.png')).not.toBeNull();
    expect(container.querySelector('.custom-image-block-clear')).not.toBeNull();
  });

  it('dispatches updateCustomImageBlock when a file is dropped onto the block', async () => {
    processImageFile.mockResolvedValueOnce({ image: 'data:image/jpeg;base64,dropped', alt: 'dropped.png' });
    const { container, store } = renderCustom(content);
    const file = new File(['x'], 'dropped.png', { type: 'image/png' });

    await act(async () => {
      fireEvent.drop(container.querySelector('.custom-image-block'), { dataTransfer: { files: [file] } });
    });

    expect(store.dispatched).toContainEqual({
      type: 'project/updateCustomImageBlock',
      payload: { id: 'c1', blockId: 'b1', image: 'data:image/jpeg;base64,dropped', alt: 'dropped.png' },
    });
  });

  it('empty image block has no remove-image button', () => {
    const { container } = renderCustom(content);
    expect(container.querySelector('.custom-image-block-clear')).toBeNull();
  });

  it('remove-image button dispatches empty strings via updateCustomImageBlock', () => {
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
    expect(container.querySelector('.custom-block:nth-child(1) .card-ref-display')).not.toBeNull();
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

  it('the first block has no move-up button, the last has no move-down button', () => {
    const { getByRole, queryByRole } = renderCustom(content);
    expect(queryByRole('button', { name: 'Move Block 1 up' })).toBeNull();
    expect(getByRole('button', { name: 'Move Block 1 down' })).not.toBeNull();
    expect(getByRole('button', { name: 'Move Block 2 up' })).not.toBeNull();
    expect(queryByRole('button', { name: 'Move Block 2 down' })).toBeNull();
  });

  it('move up/down dispatches moveCustomBlock with the right direction', () => {
    const { getByRole, store } = renderCustom(content);

    fireEvent.click(getByRole('button', { name: 'Move Block 2 up' }));
    expect(store.dispatched).toEqual([
      { type: 'project/moveCustomBlock', payload: { id: 'c1', blockId: 'b2', direction: 'up' } },
    ]);

    fireEvent.click(getByRole('button', { name: 'Move Block 1 down' }));
    expect(store.dispatched).toEqual([
      { type: 'project/moveCustomBlock', payload: { id: 'c1', blockId: 'b2', direction: 'up' } },
      { type: 'project/moveCustomBlock', payload: { id: 'c1', blockId: 'b1', direction: 'down' } },
    ]);
  });
});

// Integration coverage for the "#" trigger (useCardRefTrigger/CardRefPicker)
// through a real field - CustomTextBlock is the best candidate per the spec
// since it covers both the custom card and (via field='notes') the monster
// card's Notes section. Needs a richer store than makeStore above (other
// cards to search over, with titles/editedOn), so it builds its own.
describe('CustomContent - card references (# trigger)', () => {
  const makeRefStore = () => {
    const dispatched = [];
    const state = {
      project: {
        present: {
          cards: {
            c1: { title: 'Current Card', content: buildCustomContent({ blocks: [{ id: 'b1', type: 'text', text: '' }] }) },
            c2: { title: 'Goblin Camp', content: {}, editedOn: 5 },
            c3: { title: 'Tavern', content: {}, editedOn: 10 },
          },
        },
      },
    };
    return {
      getState: () => state,
      dispatched,
      dispatch: (action) => { dispatched.push(action); return action; },
      subscribe: () => () => {},
    };
  };

  const renderRefCustom = (store) => {
    const utils = render(<Provider store={store}><CustomContent cardId='c1' /></Provider>);
    return { ...utils, store };
  };

  // The block starts empty, so display mode shows the placeholder text -
  // click it to swap in the real textarea, same as the "text block" describe
  // block above.
  const enterEditAndGetTextarea = (getByText, getByPlaceholderText) => {
    fireEvent.mouseDown(getByText('Type anything...'));
    return getByPlaceholderText('Type anything...');
  };

  it('typing "#" opens the picker; selecting a result inserts a #[Title](id) token', () => {
    const { getByText, getByPlaceholderText, store } = renderRefCustom(makeRefStore());
    const textarea = enterEditAndGetTextarea(getByText, getByPlaceholderText);

    fireEvent.change(textarea, { target: { value: '#gob', selectionStart: 4, selectionEnd: 4 } });
    expect(screen.getByText('Goblin Camp')).not.toBeNull();
    expect(screen.queryByText('Current Card')).toBeNull(); // host card excluded
    expect(screen.queryByText('Tavern')).toBeNull(); // doesn't match the query

    fireEvent.keyDown(textarea, { key: 'Enter' });

    expect(textarea.value).toBe('#[Goblin Camp](c2)');
    expect(store.dispatched.some(a => a.type === 'project/addCardRef')).toBe(false);
    expect(screen.queryByRole('button', { name: 'Goblin Camp' })).toBeNull(); // picker closes on select

    fireEvent.blur(textarea);
    expect(store.dispatched).toContainEqual({
      type: 'project/updateCustomTextBlock',
      payload: { id: 'c1', blockId: 'b1', text: '#[Goblin Camp](c2)' },
    });

    // Back in display mode, the token renders as a resolved chip, not raw text.
    expect(screen.getByText('Goblin Camp')).not.toBeNull();
    expect(screen.queryByText('#[Goblin Camp](c2)')).toBeNull();
  });

  it('an empty query after "#" lists cards, most recently edited first', () => {
    const { getByText, getByPlaceholderText } = renderRefCustom(makeRefStore());
    const textarea = enterEditAndGetTextarea(getByText, getByPlaceholderText);

    fireEvent.change(textarea, { target: { value: '#', selectionStart: 1, selectionEnd: 1 } });

    const options = document.querySelectorAll('.card-ref-picker-option');
    expect(Array.from(options).map(o => o.textContent)).toEqual(['Tavern', 'Goblin Camp']);
  });

  it('shows an empty state for a query that matches nothing', () => {
    const { getByText, getByPlaceholderText } = renderRefCustom(makeRefStore());
    const textarea = enterEditAndGetTextarea(getByText, getByPlaceholderText);

    fireEvent.change(textarea, { target: { value: '#zzz', selectionStart: 4, selectionEnd: 4 } });
    expect(screen.getByText('No matching cards')).not.toBeNull();
  });

  it('Escape closes the picker without reverting the typed text', () => {
    const { getByText, getByPlaceholderText } = renderRefCustom(makeRefStore());
    const textarea = enterEditAndGetTextarea(getByText, getByPlaceholderText);

    fireEvent.change(textarea, { target: { value: '#zzz', selectionStart: 4, selectionEnd: 4 } });
    expect(screen.getByText('No matching cards')).not.toBeNull();

    fireEvent.keyDown(textarea, { key: 'Escape' });

    expect(screen.queryByText('No matching cards')).toBeNull();
    expect(textarea.value).toBe('#zzz');
  });

  // Every arrow press is keydown THEN keyup. The keyup re-syncs the caret,
  // which used to reset the highlight to the first result - so the
  // highlight sprang back to the top the moment it was moved. Firing both
  // halves here is what makes this a real regression test.
  const pressArrow = (textarea, key) => {
    fireEvent.keyDown(textarea, { key });
    fireEvent.keyUp(textarea, { key });
  };

  it('ArrowDown/ArrowUp move the highlighted result, and it stays put on keyup', () => {
    const { getByText, getByPlaceholderText } = renderRefCustom(makeRefStore());
    const textarea = enterEditAndGetTextarea(getByText, getByPlaceholderText);

    fireEvent.change(textarea, { target: { value: '#', selectionStart: 1, selectionEnd: 1 } });
    // Tavern (editedOn 10) sorts first, so it starts highlighted.
    expect(screen.getByText('Tavern').className).toMatch(/highlighted/);

    pressArrow(textarea, 'ArrowDown');
    expect(screen.getByText('Goblin Camp').className).toMatch(/highlighted/);

    pressArrow(textarea, 'ArrowUp');
    expect(screen.getByText('Tavern').className).toMatch(/highlighted/);
  });

  it('editing the query does restart the highlight, since the results changed', () => {
    const { getByText, getByPlaceholderText } = renderRefCustom(makeRefStore());
    const textarea = enterEditAndGetTextarea(getByText, getByPlaceholderText);

    fireEvent.change(textarea, { target: { value: '#', selectionStart: 1, selectionEnd: 1 } });
    pressArrow(textarea, 'ArrowDown');
    expect(screen.getByText('Goblin Camp').className).toMatch(/highlighted/);

    // Narrowing to a different result list should highlight its first entry.
    fireEvent.change(textarea, { target: { value: '#tav', selectionStart: 4, selectionEnd: 4 } });
    expect(screen.getByText('Tavern').className).toMatch(/highlighted/);
  });
});
