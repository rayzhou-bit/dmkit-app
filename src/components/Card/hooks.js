import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../store/actionIndex';

import { LightColors } from '../../styles/colors';
import LibraryIcon from '../../assets/icons/library-icon.png';
import RedTrashIcon from '../../assets/icons/red-trash.png';
import { PopupKeys } from '../Popup/PopupKey';

export const useTitleHooks = ({
  color,
  saveNewValue,
  setIsEditingParent,
  value,
}) => {
  const [ titleValue, setTitleValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const titleRef = useRef();

  useEffect(() => {
    setTitleValue(value);
  }, [setTitleValue, value]);

  const endEdit = () => {
    if (isEditing) {
      document.getSelection().removeAllRanges();
      if (titleValue !== value) {
        saveNewValue(titleValue);
      }
      setIsEditing(false);
      if (setIsEditingParent) {
        setIsEditingParent(false);
      }
    }
  };

  let inputClassName = '';
  if (isEditing) {
    inputClassName += 'editing';
    if (color === 'cotton_blue') {
      inputClassName += '-2';
    }
  }

  return {
    titleRef,
    titleValue,
    readOnly: !isEditing,
    inputClassName,
    changeTitleValue: (newValue) => setTitleValue(newValue),
    beginTitleEdit: () => {
      if (!isEditing) {
        setIsEditing(true);
        if(setIsEditingParent) {
          setIsEditingParent(true);
        }
        titleRef.current.focus();
        titleRef.current.setSelectionRange(
          titleRef.current.value.length,
          titleRef.current.value.length,
        );
      }
    },
    endTitleEdit: endEdit,
    handleTitleKeyPress: (event) => {
      if (isEditing) {
        if(event.key === 'Enter' || event.key === 'Tab') {
          endEdit();
        }
      }
    },
  };
};

export const useColorDropdownHooks = ({
  color,
}) => {
  const [ isColorDropdownOpen, setIsColorDropdownOpen ] = useState(false);
  const colorDropdownBtnRef = useRef();

  return {
    colorDropdownBtnRef,
    isColorDropdownOpen,
    isLightColor: LightColors.includes(color),
    openColorDropdown: () => setIsColorDropdownOpen(!isColorDropdownOpen),
    closeColorDropdown: () => setIsColorDropdownOpen(false),
  };
};

export const useOptionsDropdownHooks = ({
  beginTitleEdit,
  cardId,
}) => {
  const dispatch = useDispatch();

  const [ isOptionDropdownOpen, setIsOptionDropdownOpen ] = useState(false);
  const optionDropdownBtnRef = useRef();

  const options = [
    // {
    //   title: 'Insert image',
    //   callback: () => {},
    // },
    {
      title: 'Duplicate card',
      callback: () => dispatch(actions.copyCard(cardId)),
    },
    {},
    {
      title: 'Rename',
      callback: () => beginTitleEdit(),
    },
    {},
    // {
    //   title: 'Bring to front',
    //   callback: () => {},
    // },
    // {
    //   title: 'Send to back',
    //   callback: () => {},
    // },
    {
      title: 'Move to unsorted',
      callback: () => dispatch(actions.unlinkCardFromView(cardId)),
      icon: LibraryIcon,
    },
    {},
    {
      title: 'Delete',
      type: 'danger',
      callback: () => dispatch(actions.setPopup({
        id: cardId,
        type: PopupKeys.CONFIRM_CARD_DELETE,
      })),
      icon: RedTrashIcon,
    },
  ];

  return {
    optionDropdownBtnRef,
    isOptionDropdownOpen,
    options,
    openOptionsDropdown: () => setIsOptionDropdownOpen(!isOptionDropdownOpen),
    closeOptionsDropdown: () => setIsOptionDropdownOpen(false),
  };
};
