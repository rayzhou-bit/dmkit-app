import React from 'react';

import './Menu.scss';

// Creates a Menu using an array of options
//  Each option should have a name and a call.
//  If there is no call, a divider is created.

// TODO: add submenus

const Menu = props => {
  const {options} = props;

  let optionList = [];
  if (options) {
    for (let i in options) {
      const option = options[i];
      let thisOption = <hr className="solid"/>;
      if (option[1]) {
        thisOption = (
          <button className="btn-any" onClick={option[1]}>
              {option[0]}
          </button>
        );
      }
      optionList = [
        ...optionList,
        thisOption
      ];
    }
  }

  return (
    <div className="menu-list">
      {optionList}
    </div>
  );
};

export default Menu;