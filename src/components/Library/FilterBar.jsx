import React from 'react';
import ColorDropdown from '../../components-shared/Dropdowns/ColorDropdown';
import { FILTER_OPTIONS, useColorDropdownHooks } from './hooks';
import './index.scss';
import '../../styles/colors.scss';
import { CARD_COLOR_KEYS } from '../../styles/colors';

const FilterBar = ({
  filterOption,
  setFilterOption,
  filterColor,
  setFilterColor,
}) => {
  const {
    colorDropdownBtnRef,
    isColorDropdownOpen,
    openColorDropdown,
    closeColorDropdown,
  } = useColorDropdownHooks();

  return (
    <div className='selection-row'>
      <div className='title'>
        <span>Filter</span>
      </div>
      <div className='selections'>
        <div className='color-selection'>
          <button
            className={`option ${filterOption === FILTER_OPTIONS.color ? 'selected' : null}`}
            onClick={() => setFilterOption(FILTER_OPTIONS.color)}
          >
            <span>Color</span>
            <button className={`color-display ${CARD_COLOR_KEYS[filterColor] ?? '#F4F4F4'}`} onClick={() => openColorDropdown()} ref={colorDropdownBtnRef} />
          </button>
          <ColorDropdown
            btnRef={colorDropdownBtnRef}
            isOpen={isColorDropdownOpen}
            message="Filter by card color"
            onClose={closeColorDropdown}
            onUpdateColor={setFilterColor}
            selectedColor={filterColor}
          />
        </div>
        <div className='divider' />
        <button
          className={`option ${filterOption === FILTER_OPTIONS.thisTab ? 'selected' : null}`}
          onClick={() => setFilterOption(FILTER_OPTIONS.thisTab)}
        >
          <span>In this tab</span>
        </button>
        <button
          className={`option ${filterOption === FILTER_OPTIONS.all ? 'selected' : null}`}
          onClick={() => setFilterOption(FILTER_OPTIONS.all)}
        >
          <span>In all tabs</span>
        </button>
        <button
          className={`option ${filterOption === FILTER_OPTIONS.unsorted ? 'selected' : null}`}
          onClick={() => setFilterOption(FILTER_OPTIONS.unsorted)}
        >
          <span>In no tabs</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
