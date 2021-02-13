import React from 'react';

import './Modal.scss';
import Backdrop from '../Backdrop/Backdrop';

const modal = props => {
  const {showModal, onModalClick, children} = props;

  const modalStyle = {
    transform: showModal ? 'translateY(0)' : 'translateY(-100vh)',
    opacity: showModal ? '1' : '0',
  }

  return (
    <>
      <Backdrop show={showModal} clicked={onModalClick} />
      <div
        className="modal"
        style={modalStyle}>
        {children}
      </div>
    </>
  );
};

export default React.memo(modal,
  (prevProps, nextProps) =>
    nextProps.show !== prevProps.show &&
    nextProps.children !== prevProps.children  
);