import React from 'react';
import { Rnd } from "react-rnd";

import "./index.scss";
import { TAB_WIDTH, useTabHooks } from './hooks';
import ActionDropdown from '../../components-shared/Dropdowns/ActionDropdown';

import './index.scss';
import DropdownArrowIcon from '../../assets/icons/dropdown-arrow.svg';

const Tab = ({
  id,
}) => {
  const {
    setRndRef,
    isActiveTab,
    switchTab,
    isDragging,
    onDragStart,
    onDragStop,
    
    titleRef,
    titleValue,
    readOnly,
    inputClassName,
    changeTitleValue,
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,
    
    dropUpBtnRef,
    showTabMenuDropup,
    openTabMenuDropup,
    closeTabMenuDropup,
    dropUpOptions,
  } = useTabHooks({ id });

  return (
    <Rnd
      key={id}
      disableDragging={!readOnly}
      dragAxis='x'
      dragHandleClassName='input-div'
      enableResizing={false}
      onDragStart={onDragStart}
      onDragStop={onDragStop}
      onClick={switchTab}
      ref={node => setRndRef(node)}
      size={{ width: TAB_WIDTH, height: 32 }}
      style={{ zIndex: isDragging ? 100 : 0 }}
    >
      <div className={'tab' + (isActiveTab ? ' active' : '') + (isDragging ? ' dragging' : '')}>
        <div className='input-div'>
          <input
            className={inputClassName + (isActiveTab ? ' active' : '')}
            maxLength='50'
            onBlur={endTitleEdit}
            onChange={event => changeTitleValue(event.target.value)}
            onDoubleClick={beginTitleEdit}
            onDragOver={(e) => e.preventDefault()}
            onKeyDown={handleTitleKeyPress}
            placeholder='Fill me in!'
            readOnly={readOnly}
            ref={titleRef}
            title={titleValue}
            type='text'
            value={titleValue}
          />
        </div>
        <button
          className='tab-dropup-btn'
          ref={dropUpBtnRef}
          onClick={showTabMenuDropup ? closeTabMenuDropup : openTabMenuDropup}
        >
          <img src={DropdownArrowIcon} />
        </button>
        <ActionDropdown
          variant='dropup'
          btnRef={dropUpBtnRef}
          isOpen={showTabMenuDropup}
          onClose={closeTabMenuDropup}
          items={dropUpOptions}
        />
      </div>
    </Rnd>
  );
};

export default Tab;
