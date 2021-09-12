import React from 'react';

import './Button.scss';

const Button = props => {
  const {pos, disabled, img,
    clicked} = props;

  <button className="create-card toolmenu-item btn-32" 
    disabled={disabled}
    onClick={clicked}>
    <img src={img} alt="Add" draggable="false" />
    <span className="tooltip">{(userId && !activeCampaignId) ? "Please select a project first." : "Add card"}</span>
  </button>
};

export default Button;