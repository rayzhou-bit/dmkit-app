import React from 'react';

import './Backdrop.scss';

// TODO delete

const backdrop = (props) => (
  props.show 
    ? <div className="backdrop" onClick={props.clicked} /> 
    : null
);

export default backdrop;