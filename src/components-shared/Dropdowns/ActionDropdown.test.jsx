import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import ActionDropdown, { ACTION_TYPE } from './ActionDropdown';
import { CARD_COLOR_KEYS } from '../../constants/colors';

const renderDropdown = (items, onClose = () => {}) => render(
  <ActionDropdown isOpen={true} items={items} onClose={onClose} btnRef={{ current: null }} />
);

describe('ActionDropdown', () => {
  it('renders titled items, separators and icons, and runs the callback then closes', () => {
    const callback = vi.fn();
    const onClose = vi.fn();
    const { container } = renderDropdown([
      { title: 'One', callback, icon: 'x.svg' },
      {},
      { title: 'Two', type: ACTION_TYPE.danger, callback: () => {} },
    ], onClose);
    expect(container.querySelectorAll('li.break')).toHaveLength(1);
    expect(container.querySelector('img.selection-icon')).not.toBeNull();
    expect(screen.getByText('Two').classList.contains('danger')).toBe(true);
    fireEvent.click(screen.getByText('One'));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders a colour row with a swatch per colour, marks the selected one, and calls onSelect', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const { container } = renderDropdown([{ colors: { selected: 'pink', onSelect } }], onClose);
    const swatches = container.querySelectorAll('.color-swatch');
    expect(swatches).toHaveLength(Object.keys(CARD_COLOR_KEYS).length);
    expect(container.querySelectorAll('.color-swatch.selected')).toHaveLength(1);
    expect(container.querySelector('.color-swatch.pink.selected')).not.toBeNull();
    fireEvent.click(container.querySelector('.color-swatch.cobalt'));
    expect(onSelect).toHaveBeenCalledWith('cobalt');
    expect(onClose).not.toHaveBeenCalled();
  });
});

