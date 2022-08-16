import React from 'react';

import './index.scss';

const CardContent = ({
  textareaConfig,
}) => {

  return (
    <div className="card-content">
      <textarea
        className="text-textarea"
        {...textareaConfig}
      />
    </div>
  );
};

export default CardContent;