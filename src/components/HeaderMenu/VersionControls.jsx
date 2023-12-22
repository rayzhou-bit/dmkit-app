import React from 'react';

import { useVersionControlHooks } from './hooks';

import './index.scss';
import UndoDisabledIcon from '../../assets/icons/undo-disabled.svg';
import UndoEnabledIcon from '../../assets/icons/undo-enabled.svg';
import RedoDisabledIcon from '../../assets/icons/redo-disabled.svg';
import RedoEnabledIcon from '../../assets/icons/redo-enabled.svg';
import SaveDisabledIcon from '../../assets/icons/save-disabled.svg';
import SaveEnabledIcon from '../../assets/icons/save-enabled.svg';
import SavePendingIcon from '../../assets/icons/save-pending.svg';
import SaveSpinnerIcon from '../../assets/icons/save-spinner.svg';
import SaveCompletedIcon from '../../assets/icons/save-completed.svg';

const VersionControls = () => {
  const {
    undo,
    disableUndo,
    redo,
    disableRedo,
    save,
    saveStatus,
  } = useVersionControlHooks();

  let saveIcon = SaveEnabledIcon;
  switch (saveStatus) {
    case 'disabled':
      saveIcon = SaveDisabledIcon;
      break;
    case 'pending':
      saveIcon = SavePendingIcon;
      break;
    case 'saving':
      saveIcon = SaveSpinnerIcon;
      break;
    case 'completed':
      saveIcon = SaveCompletedIcon;
      break;
  }
  
  return (
    <div className='version-controls'>
      <button
        className='undo'
        disabled={disableUndo}
        onClick={undo}
      >
        <img alt='undo' draggable='false' src={disableUndo ? UndoDisabledIcon : UndoEnabledIcon} />
      </button>
      <button
        className='redo'
        disabled={disableRedo}
        onClick={redo}
      >
        <img alt='redo' draggable='false' src={disableRedo ? RedoDisabledIcon : RedoEnabledIcon} />
      </button>
      <button
        className='save'
        disabled={saveStatus === 'disabled'}
        onClick={save}
      >
        <span>Save</span>
        <img
          alt='save'
          className={saveStatus === 'saving' ? 'spin' : null}
          draggable='false'
          src={saveIcon}
        />
      </button>
    </div>
  );
};

export default VersionControls;