import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../store/actionIndex';
import { LightColors } from '../../styles/colors';
import { PopupKeys } from '../Popup/PopupKey';

import LibraryIcon from '../../assets/icons/library-icon.png';
import RedTrashIcon from '../../assets/icons/red-trash.png';

export const useTitleHooks = ({
  saveNewValue,
  setEditingCard,
  value,
}) => {
  const [ titleValue, setTitleValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const titleRef = useRef();

  // Initialize title value
  useEffect(() => {
    setTitleValue(value);
  }, [value]);

  const beginTitleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditingCard(true);
      titleRef.current.focus();
      titleRef.current.setSelectionRange(
        titleRef.current.value.length,
        titleRef.current.value.length,
      );
    }
  };

  const endTitleEdit = () => {
    if (isEditing) {
      document.getSelection().removeAllRanges();
      saveNewValue(titleValue);
      setIsEditing(false);
      setEditingCard(false);
    }
  };

  const handleTitleKeyPress = (event) => {
    if(event.key === 'Enter' || event.key === 'Tab') {
      endTitleEdit();
    }
  };

  return {
    titleRef,
    titleValue,
    readOnly: !isEditing,
    inputClassName: isEditing ? 'editing' : '',
    changeTitleValue: (newValue) => setTitleValue(newValue),
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,
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
      icon: RedTrashIcon,
      callback: () => dispatch(actions.setPopup({
        type: PopupKeys.CONFIRM_CARD_DELETE,
        id: cardId,
      })),
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

export const useContentHooks = ({
  saveNewValue,
  setEditingCard,
  value,
}) => {
  const [ contentValue, setContentValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const contentRef = useRef();

  // Initialize content value
  useEffect(() => {
    setContentValue(value);
  }, [value]);

  const beginContentEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditingCard(true);
      contentRef.current.focus();
      contentRef.current.setSelectionRange(
        contentRef.current.value.length,
        contentRef.current.value.length,
      );
    }
  };

  const endContentEdit = () => {
    if (isEditing) {
      document.getSelection().removeAllRanges();
      saveNewValue(contentValue);
      setIsEditing(false);
      setEditingCard(false);
    }
  };

  return {
    contentRef,
    contentValue,
    readOnly: !isEditing,
    changeContentValue: (newValue) => setContentValue(newValue),
    beginContentEdit,
    endContentEdit,
  };
};
