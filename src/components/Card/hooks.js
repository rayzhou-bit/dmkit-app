import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useOutsideClick from '../../utils/useOutsideClick';

import { actions } from '../../data/redux';
import { CARD_COLOR_KEYS, LIGHT_COLORS } from '../../styles/colors';
import { POPUP_KEYS } from '../Popup/PopupKey';
import { ACTION_TYPE } from '../../components-shared/Dropdowns/ActionDropdown';

import LibraryIcon from '../../assets/icons/library-icon.png';
import RedTrashIcon from '../../assets/icons/red-trash.png';
import { DEFAULT_CARD_POSITION } from '../../data/redux/project/constants';

export const ANIMATION = {
  cardBlink: 'card-blink .25s step-end 4 alternate',
  libraryCardBlink: 'library-card-blink .25s step-end 4 alternate',
};

export const useCardHooks = ({
  cardId,
  toolMenuRef,
  cardAnimation,
  setCardAnimation,
}) => {
  const dispatch = useDispatch();

  const activeCard = useSelector(state => state.session.activeCardId);
  const activeTab = useSelector(state => state.project.present.activeViewId);
  const activeTabScale = useSelector(state => activeTab ? state.project.present.views[activeTab]?.scale : null);
  const {
    pos: cardPosition,
    size: cardSize,
  } = useSelector( state => state.project.present.cards[cardId].views[activeTab]);

  
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const cardRef = useRef();

  const isActive = cardId === activeCard;

  useOutsideClick([cardRef, toolMenuRef], isSelected, 
    () => {
      if (isActive) dispatch(actions.session.setActiveCard({ id: null }));
      setIsSelected(false);
    }
  );

  let zIndex = (100 * cardPosition.y) + cardPosition.x + 10;
  if (isDragging) {
    zIndex = 20000 * (cardPosition.y + cardPosition.x + 10);
  } else if (isActive) {
    zIndex = 20000 * (cardPosition.y + cardPosition.x + 10);
  }

  return {
    cardRef,
    isActive,
    activeTabScale,
    size: cardSize,
    position: cardPosition,
    rndStyle: { zIndex },
    animationStyle: { animation: cardAnimation ? cardAnimation[cardId] : null },
    isEditing,
    setIsEditing,
    onDragStart: () => setIsDragging(true),
    onDragStop: (event, data) => {
      setIsDragging(false);
      if (cardPosition) {
        if (cardPosition.x !== data.x || cardPosition.y !== data.y) {
          dispatch(actions.project.updateCardPosition({
            id: cardId,
            position: { x: data.x, y: data.y },
          }));
        }
      } else {
        dispatch(actions.project.updateCardPosition({
          id: cardId,
          position: { x: data.x, y: data.y },
        }));
      }
    },
    onResizeStop: (event, direction, ref, delta, position) => {
      if (delta.width !== 0 || delta.height !== 0) {
        dispatch(actions.project.updateCardSize({
          id: cardId,
          size: { width: ref.style.width, height: ref.style.height },
        }));
        if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
          dispatch(actions.project.updateCardPosition({
            id: cardId,
            position: { x: position.x, y: position.y },
          }));
        }
      }
    },
    onClick: () => {
      if (!isSelected) {
        if (!isActive) dispatch(actions.session.setActiveCard({ id: cardId }));
        setIsSelected(true);
      }
    },
    onAnimationEnd: () => setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    }),
  };
};

export const useLibraryCardHooks = ({
  cardId,
}) => {
  const dispatch = useDispatch();

  const activeCard = useSelector(state => state.session.activeCardId);
  const activeTab = useSelector(state => state.project.present.activeViewId);
  const cardTabs = useSelector(state => state.project.present.cards[cardId].views);

  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cardAnimation, setCardAnimation] = useState({});
  const [useAnimation, setUseAnimation] = useState(false);

  const libraryCardRef = useRef();

  const isActive = cardId === activeCard;

  useOutsideClick([libraryCardRef], isSelected, 
    () => {
      if (isActive) dispatch(actions.session.setActiveCard({ id: null }));
      setIsSelected(false);
    }
  );

  return {
    libraryCardRef,
    isActive,
    isSelected,
    isEditing,
    cardAnimation: { animation: cardAnimation[cardId] },
    setIsEditing,
    onDragStart: (event) => {
      event.dataTransfer.setData('text', cardId);
      if (cardTabs[activeTab]) {
        setUseAnimation(true);
      }
    },
    onDragEnd: () => {
      if (useAnimation)  {
        setCardAnimation({
          ...cardAnimation,
          [cardId]: ANIMATION.libraryCardBlink,
        });
        setUseAnimation(false);
      }
    },
    onAnimationEnd: () => setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    }),
    onClick: () => {
      if (!isSelected) {
        if (cardId !== activeCard) dispatch(actions.session.setActiveCard({ id: cardId }));
        setIsSelected(true);
      }
    },
  };
};

export const useTitleHooks = ({
  cardId,
  setEditingCard,
}) => {
  const dispatch = useDispatch();

  const title = useSelector(state => state.project.present.cards[cardId].title);

  const [ titleValue, setTitleValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const titleRef = useRef();

  // Initialize title value
  useEffect(() => {
    setTitleValue(title);
  }, [title]);

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
      dispatch(actions.project.updateCardTitle({
        id: cardId,
        title: titleValue,
      }));
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
    inputClassName: isEditing ? 'editing' : '',
    readOnly: !isEditing,
    titleRef,
    titleValue,
    changeTitleValue: (newValue) => setTitleValue(newValue),
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,
  };
};

export const useColorDropdownHooks = ({
  cardId,
}) => {
  const dispatch = useDispatch();
  let color = useSelector(state => state.project.present.cards[cardId].color);
  color = CARD_COLOR_KEYS[color] ?? CARD_COLOR_KEYS.gray;
  const [ isColorDropdownOpen, setIsColorDropdownOpen ] = useState(false);
  const colorDropdownBtnRef = useRef();

  return {
    color,
    colorDropdownBtnRef,
    isColorDropdownOpen,
    isLightColor: LIGHT_COLORS.includes(color),
    openColorDropdown: () => setIsColorDropdownOpen(!isColorDropdownOpen),
    closeColorDropdown: () => setIsColorDropdownOpen(false),
    updateColor: (newColor) => dispatch(actions.project.updateCardColor({
      id: cardId,
      color: newColor,
    })),
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
    {
      title: 'Duplicate card',
      callback: () => dispatch(actions.project.copyCard({ id: cardId })),
    },
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
      title: 'Move to the library',
      type: ACTION_TYPE.bold,
      callback: () => dispatch(actions.project.unlinkCardFromView({ id: cardId })),
      icon: LibraryIcon,
    },
    {},
    {
      title: 'Delete',
      type: ACTION_TYPE.danger,
      icon: RedTrashIcon,
      callback: () => dispatch(actions.session.setPopup({
        type: POPUP_KEYS.confirmCardDelete,
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

export const useOptionsDropdownLibraryHooks = ({
  beginTitleEdit,
  cardId,
}) => {
  const dispatch = useDispatch();

  const activeTab = useSelector(state => state.project.present.activeViewId);
  const cardTabs = useSelector(state => state.project.present.cards[cardId].views);
  const [ isOptionDropdownOpen, setIsOptionDropdownOpen ] = useState(false);
  const optionDropdownBtnRef = useRef();

  const options = [
    {
      title: 'Add to tab',
      type: cardTabs[activeTab] ? ACTION_TYPE.disabled : null,
      callback: () => dispatch(actions.project.linkCardToView({ id: cardId, position: DEFAULT_CARD_POSITION })),
    },
    {
      title: 'Remove from tab',
      type: cardTabs[activeTab] ? null : ACTION_TYPE.disabled,
      callback: () => dispatch(actions.project.unlinkCardFromView({ id: cardId })),
    },
    // {
    //   title: 'Duplicate card',
    //   callback: () => dispatch(actions.project.copyCard({ id: cardId })),
    // },
    {},
    {
      title: 'Rename',
      callback: () => beginTitleEdit(),
    },
    {},
    {
      title: 'Delete',
      type: ACTION_TYPE.danger,
      icon: RedTrashIcon,
      callback: () => dispatch(actions.session.setPopup({
        type: POPUP_KEYS.confirmCardDelete,
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
  cardId,
  setEditingCard,
}) => {
  const dispatch = useDispatch();
  const text = useSelector(state => state.project.present.cards[cardId].content.text);

  const [ contentValue, setContentValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const contentRef = useRef();

  // Initialize content value
  useEffect(() => {
    setContentValue(text);
  }, [text]);

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
      dispatch(actions.project.updateCardText({
        id: cardId,
        text: contentValue,
      }));
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
