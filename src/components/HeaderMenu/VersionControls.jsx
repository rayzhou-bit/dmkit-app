import React from 'react';

import { useVersionControlHooks, SAVE_BUTTON } from './hooks';

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
    saveButtonStatus,
  } = useVersionControlHooks();

  let saveIcon = SaveEnabledIcon;
  switch (saveButtonStatus) {
    case SAVE_BUTTON.disabled:
      saveIcon = SaveDisabledIcon;
      break;
    case SAVE_BUTTON.pending:
      saveIcon = SavePendingIcon;
      break;
    case SAVE_BUTTON.saving:
      saveIcon = SaveSpinnerIcon;
      break;
    case SAVE_BUTTON.completed:
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
        disabled={saveButtonStatus === SAVE_BUTTON.disabled}
        onClick={save}
      >
        <span>Save</span>
        <img
          alt='save'
          className={saveButtonStatus === SAVE_BUTTON.saving ? 'spin' : null}
          draggable='false'
          src={saveIcon}
        />
      </button>
    </div>
  );
};

export default VersionControls;