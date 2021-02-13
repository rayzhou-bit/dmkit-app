import React from 'react';

const modal = props => {
  const backdrop = props.show ? <div className="backdrop" onClick={props.clicked}/> : null;

  return (
    <>
      {backdrop}
      <div
        className="modal"
        style={{
          transform: props.show ? 'translateY(0)' : 'translateY(-100vh)',
          opacity: props.show ? '1' : '0'
        }}>
        {props.children}
      </div>
    </>
  );
};

export default React.memo(modal,
  (prevProps, nextProps) =>
    nextProps.show !== prevProps.show &&
    nextProps.children !== prevProps.children  
);