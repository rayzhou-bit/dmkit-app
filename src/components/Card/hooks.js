import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useOutsideClick from '../../utils/useOutsideClick';

import { copySelectedCard } from '../../data/redux/thunkActions';
import { actions, selectors } from '../../data/redux';
import { CARD_COLOR_KEYS, LIGHT_COLORS } from '../../constants/colors';
import { getCardType, hasCardContent, CARD_TYPES } from '../../constants/cards';
import { processImageFile } from '../../utils/imageUtils';
import { MAX_PORTRAIT_DATA_URI_LENGTH, PORTRAIT_MAX_EDGE_STEPS } from '../../constants/images';
import { MONSTER_FIELDS, MONSTER_SECTIONS, MONSTER_COLUMN_SECTIONS, DEFAULT_COLLAPSED } from '../../constants/monster';
import { POPUP_KEYS } from '../Popup/PopupKey';
import { ACTION_TYPE } from '../../components-shared/Dropdowns/ActionDropdown';
import { useGroupDragPosition } from '../Canvas/groupDrag';

import LibraryIcon from '../../assets/icons/library-open.svg';
import RedTrashIcon from '../../assets/icons/trash-red.svg';
import { DEFAULT_CARD_POSITION, MIN_CARD_SIZE, MONSTER_MIN_CARD_SIZE } from '../../constants/dimensions';
import generateUID from '../../utils/generateUID';

export const ANIMATION = {
  cardBlink: 'card-blink .25s step-end 4 alternate',
  libraryCardBlink: 'card-blink .25s step-end 4 alternate',
};

export const useCardHooks = ({
  cardId,
  toolMenuRef,
  cardAnimation,
  setCardAnimation,
  groupDrag,
}) => {
  const dispatch = useDispatch();

  const activeCard = useSelector(state => state.session.activeCardId);
  const selectedCards = useSelector(state => state.session.selectedCards);
  const activeTab = useSelector(state => state.project.present.activeViewId);
  const activeTabScale = useSelector(state => activeTab ? state.project.present.views[activeTab]?.scale : null);
  const {
    pos: cardPosition,
    size: cardSize,
  } = useSelector(state => state.project.present.cards[cardId].views[activeTab]);
  const cardType = useSelector(state => getCardType(state.project.present.cards[cardId]));
  const minSize = cardType === CARD_TYPES.monster ? MONSTER_MIN_CARD_SIZE : MIN_CARD_SIZE;

  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef();
  const isActive = cardId === activeCard;
  const groupPosition = useGroupDragPosition(groupDrag, cardId);
  // Set at drag start, read at drag stop - selectedCards can change mid-drag.
  const isGroupDragRef = useRef(false);
  // Set at drag start, flipped by the first real onDrag - distinguishes a
  // plain click (no movement, both fire onDragStart/onDragStop too) from
  // an actual drag, so the trailing click doesn't collapse a selection a
  // group drag just moved.
  const hasMovedRef = useRef(false);

  // isActive can become true without a click on this card (e.g. a freshly
  // created/copied card is activated straight from the toolbar), so the
  // outside-click guard has to watch that too, not just local isSelected.
  useOutsideClick([cardRef, toolMenuRef], isActive || isSelected,
    () => {
      if (isActive) dispatch(actions.session.setActiveCard({ id: null }));
      setIsSelected(false);
    }
  );

  // A card unmounting mid-drag (deleted, or tab switched) must not strand the store.
  useEffect(() => () => {
    if (isGroupDragRef.current) groupDrag.end();
  }, []);

  let zIndex = (100 * cardPosition.y) + cardPosition.x + 10;
  if (isDragging || isActive || groupPosition !== null) {
    zIndex = 20000 * (cardPosition.y + cardPosition.x + 10);
  }

  return {
    cardRef,
    isActive,
    isSelected: selectedCards.includes(cardId),
    activeTabScale,
    size: cardSize,
    minSize,
    position: groupPosition ?? cardPosition,
    rndStyle: { zIndex },
    animationStyle: { animation: cardAnimation ? cardAnimation[cardId] : null },
    isEditing,
    setIsEditing,
    onDragStart: () => {
      setIsDragging(true);
      hasMovedRef.current = false;
      if (selectedCards.length > 1 && selectedCards.includes(cardId)) {
        isGroupDragRef.current = true;
        groupDrag.start({ leaderId: cardId });
      } else if (selectedCards.length > 0 && !selectedCards.includes(cardId)) {
        dispatch(actions.session.setSelectedCards({ cards: [] }));
      }
    },
    onDrag: (event, data) => {
      hasMovedRef.current = true;
      if (isGroupDragRef.current) groupDrag.move({ x: data.x, y: data.y });
    },
    onDragStop: (event, data) => {
      setIsDragging(false);
      if (isGroupDragRef.current) {
        const delta = groupDrag.getCommitDelta();
        if (delta.x !== 0 || delta.y !== 0) {
          dispatch(actions.project.moveCards({ ids: selectedCards, delta }));
        }
        groupDrag.end();
        isGroupDragRef.current = false;
      } else if (cardPosition) {
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
    onClick: (event) => {
      event.stopPropagation();
      // A plain click (no movement) always collapses any multi-selection to
      // just this card - a real drag already handled the selection itself.
      if (!hasMovedRef.current && selectedCards.length > 0) {
        dispatch(actions.session.setSelectedCards({ cards: [] }));
      }
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

  const activeTab = useSelector(selectors.project.activeTab);
  const cardData = useSelector(state => state.project.present.cards[cardId]);
  const content = useSelector(state => state.project.present.cards[cardId].content);
  const hasContent = hasCardContent(content);
  const [ isOptionDropdownOpen, setIsOptionDropdownOpen ] = useState(false);
  const optionDropdownBtnRef = useRef();

  const options = [
    {
      title: 'Copy card',
      callback: () => {
        dispatch(copySelectedCard({
          selectedCard: cardData,
          activeTab,
        }));
      },
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
      callback: () => {
        if (hasContent) {
          dispatch(actions.session.setPopup({
            type: POPUP_KEYS.confirmCardDelete,
            id: cardId,
          }));
        } else {
          dispatch(actions.project.destroyCard({ id: cardId }));
        }
      },
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

  const content = useSelector(state => state.project.present.cards[cardId].content);
  const hasContent = hasCardContent(content);
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
    {
      // break
    },
    {
      title: 'Rename',
      callback: () => beginTitleEdit(),
    },
    {
      // break
    },
    {
      title: 'Delete',
      type: ACTION_TYPE.danger,
      icon: RedTrashIcon,
      callback: () => {
        if (hasContent) {
          dispatch(actions.session.setPopup({
            type: POPUP_KEYS.confirmCardDelete,
            id: cardId,
          }));
        } else {
          dispatch(actions.project.destroyCard({ id: cardId }));
        }
      },
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

export const useCardType = (cardId) => useSelector(state => getCardType(state.project.present.cards[cardId]));

export const useImageContentHooks = ({
  cardId,
}) => {
  const dispatch = useDispatch();
  const image = useSelector(state => state.project.present.cards[cardId].content?.image ?? '');
  const alt = useSelector(state => state.project.present.cards[cardId].content?.alt ?? '');

  const [ isProcessing, setIsProcessing ] = useState(false);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const fileInputRef = useRef();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const openFilePicker = () => {
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    // Reset immediately so re-picking the same file after an error still fires `change`.
    event.target.value = '';
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await processImageFile(file);
      if (!isMountedRef.current) return;
      dispatch(actions.project.updateCardImage({
        id: cardId,
        image: result.image,
        alt: result.alt,
      }));
    } catch (err) {
      if (!isMountedRef.current) return;
      setErrorMessage(err.message);
    } finally {
      if (isMountedRef.current) setIsProcessing(false);
    }
  };

  return {
    image,
    alt,
    hasImage: !!image,
    fileInputRef,
    isProcessing,
    errorMessage,
    openFilePicker,
    onFileChange,
    dismissError: () => setErrorMessage(null),
  };
};

// Commit-on-blur with an equality guard: local `value` only dispatches when
// it actually differs from the store, one undo step per finished edit.
export const useMonsterFieldHooks = ({ cardId, fieldKey }) => {
  const dispatch = useDispatch();
  const storeValue = useSelector(state => state.project.present.cards[cardId].content?.[fieldKey] ?? '');
  const fieldMeta = MONSTER_FIELDS[fieldKey] ?? {};

  const [ value, setValue ] = useState('');

  useEffect(() => {
    setValue(storeValue);
  }, [storeValue]);

  const commit = () => {
    if (value !== storeValue) {
      dispatch(actions.project.updateCardMonsterFields({ id: cardId, fields: { [fieldKey]: value } }));
    }
  };

  const revert = () => setValue(storeValue);

  return {
    value,
    changeValue: (nextValue) => setValue(fieldMeta.numeric ? nextValue.replace(/\D/g, '') : nextValue),
    commit,
    revert,
    handleKeyDown: (event) => {
      if (event.key === 'Escape') {
        revert();
        return;
      }
      // Multiline fields (textareas) need Enter for newlines - only Escape applies there.
      if (!fieldMeta.multiline && (event.key === 'Enter' || event.key === 'Tab')) {
        commit();
      }
    },
  };
};

export const useMonsterSectionHooks = ({ cardId }) => {
  const dispatch = useDispatch();
  const content = useSelector(state => state.project.present.cards[cardId].content);
  // Raw per-card object, possibly undefined - not defaulted here to avoid a
  // fresh {} every render (would break memoization).
  const collapse = useSelector(state => state.session.monsterCollapse?.[cardId]);

  const isCollapsed = (key) => collapse?.[key] ?? DEFAULT_COLLAPSED[key] ?? false;

  const sectionHasContent = (key) => {
    const section = MONSTER_SECTIONS.find(s => s.key === key);
    if (!section) return false;
    return section.fields.some(f => (content?.[f] ?? '').trim().length > 0);
  };

  return {
    isCollapsed,
    sectionHasContent,
    columnHasContent: (columnKey) => (MONSTER_COLUMN_SECTIONS[columnKey] ?? []).some(s => sectionHasContent(s.key)),
    toggleSection: (key) => dispatch(actions.session.setMonsterCollapsed({
      id: cardId,
      key,
      collapsed: !isCollapsed(key),
    })),
    // The card itself never resizes here - Media (Card.scss) is the one
    // flexible column, so it absorbs whatever width Attributes/Combat give
    // up or need. Keeps this a pure view-state toggle with nothing to undo.
    toggleColumn: (columnKey) => dispatch(actions.session.setMonsterCollapsed({
      id: cardId,
      key: columnKey,
      collapsed: !isCollapsed(columnKey),
    })),
  };
};

// Deliberately duplicated from useImageContentHooks, not shared/parameterized -
// different content keys (portrait/portraitAlt), action, and compression budget.
export const useMonsterPortraitHooks = ({ cardId }) => {
  const dispatch = useDispatch();
  const portrait = useSelector(state => state.project.present.cards[cardId].content?.portrait ?? '');
  const portraitAlt = useSelector(state => state.project.present.cards[cardId].content?.portraitAlt ?? '');

  const [ isProcessing, setIsProcessing ] = useState(false);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const fileInputRef = useRef();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const openFilePicker = () => {
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    // Reset immediately so re-picking the same file after an error still fires `change`.
    event.target.value = '';
    if (!file) return;

    setIsProcessing(true);
    try {
      const result = await processImageFile(file, {
        maxEdgeSteps: PORTRAIT_MAX_EDGE_STEPS,
        maxLength: MAX_PORTRAIT_DATA_URI_LENGTH,
      });
      if (!isMountedRef.current) return;
      dispatch(actions.project.updateCardPortrait({
        id: cardId,
        portrait: result.image,
        portraitAlt: result.alt,
      }));
    } catch (err) {
      if (!isMountedRef.current) return;
      setErrorMessage(err.message);
    } finally {
      if (isMountedRef.current) setIsProcessing(false);
    }
  };

  return {
    portrait,
    portraitAlt,
    hasPortrait: !!portrait,
    fileInputRef,
    isProcessing,
    errorMessage,
    openFilePicker,
    onFileChange,
    clearPortrait: () => dispatch(actions.project.updateCardPortrait({ id: cardId, portrait: '', portraitAlt: '' })),
    dismissError: () => setErrorMessage(null),
  };
};
