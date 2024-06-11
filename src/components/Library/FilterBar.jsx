import React from 'react';
import ColorDropdown from '../../components-shared/Dropdowns/ColorDropdown';
import { FILTER_OPTIONS, useColorDropdownHooks } from './hooks';

import './index.scss';
import '../../constants/colors.scss';
import { CARD_COLOR_KEYS } from '../../constants/colors';

const FilterBar = ({
  isColorFiltered,
  setIsColorFiltered,
  filterColorOption,
  setFilterColorOption,
  filterTabOption,
  setFilterTabOption,
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
            className={`option ${isColorFiltered ? 'selected' : null}`}
            onClick={() => setIsColorFiltered(!isColorFiltered)}
          >
            <span>Color</span>
            <div
              className={`color-display ${CARD_COLOR_KEYS[filterColorOption] ?? '#F4F4F4'}`}
              onClick={(event) => openColorDropdown(event)}
              ref={colorDropdownBtnRef}
            />
          </button>
          <ColorDropdown
            btnRef={colorDropdownBtnRef}
            isOpen={isColorDropdownOpen}
            message="Filter by card color"
            onClose={closeColorDropdown}
            onUpdateColor={setFilterColorOption}
            selectedColor={filterColorOption}
          />
        </div>
        <div className='divider' />
        <button
          className={`option ${filterTabOption === FILTER_OPTIONS.thisTab ? 'selected' : null}`}
          onClick={() => setFilterTabOption(FILTER_OPTIONS.thisTab)}
        >
          <span>In this tab</span>
        </button>
        <button
          className={`option ${filterTabOption === FILTER_OPTIONS.allTab ? 'selected' : null}`}
          onClick={() => setFilterTabOption(FILTER_OPTIONS.allTab)}
        >
          <span>In all tabs</span>
        </button>
        <button
          className={`option ${filterTabOption === FILTER_OPTIONS.noTab ? 'selected' : null}`}
          onClick={() => setFilterTabOption(FILTER_OPTIONS.noTab)}
        >
          <span>In no tabs</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
