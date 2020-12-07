import React from 'react';

import './cardExistsAlert.scss';

const cardExistsAlert = React.memo(props => {
  return (
    <div className="existsAlert" style={existsAlertStyle}>
      <p>Card already exists in this canvas!</p>
    </div>
  );
});

export default cardExistsAlert;