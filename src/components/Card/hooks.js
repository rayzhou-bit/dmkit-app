import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useOutsideClick from '../../utils/useOutsideClick';

import * as actions from '../../store/actionIndex';
import { CARD_COLOR_KEYS, LIGHT_COLORS } from '../../styles/colors';
import { POPUP_KEYS } from '../Popup/PopupKey';
import { ACTION_TYPE } from '../../components-shared/Dropdowns/ActionDropdown';

import LibraryIcon from '../../assets/icons/library-icon.png';
import RedTrashIcon from '../../assets/icons/red-trash.png';

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

  const activeCard = useSelector(state => state.sessionManager.activeCardId);
  const activeTab = useSelector(state => state.campaignData.present.activeViewId);
  const activeTabScale = useSelector(state => activeTab ? state.campaignData.present.views[activeTab]?.scale : null);
  const cardPosition = useSelector(state => state.campaignData.present.cards[cardId].views[activeTab]?.pos);
  const cardSize = useSelector(state => state.campaignData.present.cards[cardId].views[activeTab]?.size);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const cardRef = useRef();

  const isActive = cardId === activeCard;

  useOutsideClick([cardRef, toolMenuRef], isSelected, 
    () => {
      if (isActive) dispatch(actions.updActiveCardId(null));
      setIsSelected(false);
    }
  );

  let zIndex = (100 * cardPosition.y) + cardPosition.x + 10;
  if (isDragging) {
    zIndex = 20000 * (cardPosition.y + cardPosition.x + 10);
  } else if (isActive) {
    zIndex = 10000 * (cardPosition.y + cardPosition.x + 10);
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
          dispatch(actions.updCardPos(cardId, {x: data.x, y: data.y}));
        }
      } else {
        dispatch(actions.updCardPos(cardId, { x: data.x, y: data.y }));
      }
    },
    onResizeStop: (event, direction, ref, delta, position) => {
      if (delta.width !== 0 || delta.height !== 0) {
        dispatch(actions.updCardSize(cardId, {width: ref.style.width, height: ref.style.height}));
        if (["top", "left", "topRight", "bottomLeft", "topLeft"].indexOf(direction) !== -1) {
          dispatch(actions.updCardPos(cardId, { x: position.x, y: position.y }));
        }
      }
    },
    onClick: () => {
      if (!isSelected) {
        if (!isActive) dispatch(actions.updActiveCardId(cardId));
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

  const activeCard = useSelector(state => state.sessionManager.activeCardId);
  const activeTab = useSelector(state => state.campaignData.present.activeViewId);
  const cardTabs = useSelector(state => state.campaignData.present.cards[cardId].views);

  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [cardAnimation, setCardAnimation] = useState({});

  const libraryCardRef = useRef();

  const isActive = cardId === activeCard;

  useOutsideClick([libraryCardRef], isSelected, 
    () => {
      if (isActive) dispatch(actions.updActiveCardId(null));
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
    onDragStart: (event) => event.dataTransfer.setData('text', cardId),
    onDragEnd: () => {
      if (cardTabs[activeTab]) {
        setCardAnimation({
          ...cardAnimation,
          [cardId]: ANIMATION.libraryCardBlink,
        });
      }
    },
    onAnimationEnd: () => setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    }),
    onClick: () => {
      if (!isSelected) {
        if (cardId !== activeCard) dispatch(actions.updActiveCardId(cardId));
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

  const title = useSelector(state => state.campaignData.present.cards[cardId].title);

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
        titleRef.current.title.length,
        titleRef.current.title.length,
      );
    }
  };

  const endTitleEdit = () => {
    if (isEditing) {
      document.getSelection().removeAllRanges();
      dispatch(actions.updCardTitle(cardId, titleValue));
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
  let color = useSelector(state => state.campaignData.present.cards[cardId].color);
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
    updateColor: (newColor) => dispatch(actions.updCardColor(cardId, newColor)),
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
      type: ACTION_TYPE.danger,
      icon: RedTrashIcon,
      callback: () => dispatch(actions.setPopup({
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
  const text = useSelector(state => state.campaignData.present.cards[cardId].content.text);

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
        contentRef.current.text.length,
        contentRef.current.text.length,
      );
    }
  };

  const endContentEdit = () => {
    if (isEditing) {
      document.getSelection().removeAllRanges();
      dispatch(actions.updCardText(cardId, contentValue));
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
