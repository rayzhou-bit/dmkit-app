import React from 'react';

import * as hooks from './hooks';

const ColorDropdown = ({
  cardId,
  colorDropdownRef,
}) => {
  const { colorList } = hooks.useColorListHook({ cardId });

  return (
    <div
      className="color-menu"
      ref={colorDropdownRef} 
    >
      {colorList}
    </div>
  );
};

export default ColorDropdown;