import React from 'react';

import './ToolMenu.scss';

const toolMenu = React.memo(props => {
  return (
    <ul className="ToolMenu">
      <li><button
        className="Button"
        onClick={props.addCard}>
        +
      </button></li>
      <li><button className="Button">2</button></li>
      <li><button className="Button">3</button></li>
      <li><button className="Button">4</button></li>
    </ul>
  );
});

export default toolMenu;