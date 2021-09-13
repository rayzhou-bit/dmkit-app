import React from 'react';

import './Button.scss';

const Button = props => {
  const {pos, disabled, 
    img, name, tooltip,
    clicked} = props;
  
  const position = pos*45 + 15 + "px";

  return (
    <div className="toolmenu-btn">
      <button className="btn-32" 
      //style={{top: position}}
        disabled={disabled}
        onClick={clicked}>
        <img src={img} draggable="false" />
        <span className="tooltip">{tooltip}</span>
      </button>
      <p>{name}</p>
    </div>
  );
};

export default Button;