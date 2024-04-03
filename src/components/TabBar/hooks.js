import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useOutsideClick from '../../utils/useOutsideClick';

import { actions } from '../../data/redux';

import { POPUP_KEYS } from '../Popup/PopupKey';
import { ACTION_TYPE } from '../../components-shared/Dropdowns/ActionDropdown';

// TAB_WIDTH handles both the styling and drag movement for tabs.
export const TAB_HEIGHT = 32;
export const TAB_WIDTH = 200;
export const POSITION_INCREMENT = TAB_WIDTH + 6;
export const SCROLL_RATIO = 1.75;

export const useTabBarHooks = () => {
  const tabs = useSelector(state => state.project.present.viewOrder || []);
  const [ position, setPosition ] = useState(0);
  const [ dropIndicatorIndex, setDropIndicatorIndex ] = useState(null);
  const [ lockScroll, setLockScroll ] = useState(false);
  const containerRef = useRef();
  const totalTabWidth = tabs.length * POSITION_INCREMENT;
  const rightBoundary = (3 * POSITION_INCREMENT) - totalTabWidth;
  const containerWidth = () => containerRef.current.getBoundingClientRect().width;

  const checkLock = () => {
    if (totalTabWidth < containerWidth()) {
      setLockScroll(true);
      const newPosition = (containerWidth() - totalTabWidth) / 2;
      setPosition(newPosition);
    } else {
      setLockScroll(false);
      if (position > 0) {
        setPosition(0);
      }
    }
  };

  // window resize event listener runs checkLock
  useEffect(() => {
    window.addEventListener('resize', checkLock);
    return () => window.removeEventListener('resize', checkLock);
  }, [tabs, containerWidth]);

  // check lock when tabs change
  useEffect(() => {
    checkLock();
  }, [lockScroll, tabs, containerWidth])

  const scrollLeft = () => {
    if (!lockScroll) {
      const newPosition = position + POSITION_INCREMENT * SCROLL_RATIO;
      if (newPosition < 0) {
        setPosition(position + POSITION_INCREMENT * SCROLL_RATIO);
      } else {
        setPosition(0);
      }
    }
  };
  const scrollRight = () => {
    if (!lockScroll) {
      const newPosition = position - POSITION_INCREMENT * SCROLL_RATIO;
      if (newPosition > rightBoundary) {
        setPosition(position - POSITION_INCREMENT * SCROLL_RATIO);
      } else {
        setPosition(rightBoundary);
      }
    }
  };
  const scrollTo = (tabId) => {
    if (!lockScroll) {
      const tabPosition = tabs.indexOf(tabId) * POSITION_INCREMENT;
      const [ leftBound, rightBound ] = [
        -tabPosition,
        containerWidth() - POSITION_INCREMENT - tabPosition,
      ];
      if (position < leftBound) {
        setPosition(leftBound);
      } else if (position > rightBound) {
        setPosition(rightBound);
      }
    }
  };

  return {
    tabs,
    containerRef,
    position,
    dropIndicatorIndex,
    setDropIndicatorIndex,
    scrollLeft,
    scrollRight,
    scrollTo,
    onWheel: (event) => {
      if (!lockScroll) {
        if (event.deltaY > 0) {
          scrollRight();
        } else {
          scrollLeft();
        }
      }
    },
    isInactiveLeft: lockScroll || position === 0,
    isInactiveRight: lockScroll || position === rightBoundary,
  };
};

export const useTabControlsHooks = ({
  scrollTo,
}) => {
  const dispatch = useDispatch();
  const [ showOverviewDropup, setShowOverviewDropup ] = useState(false);
  const activeProject = useSelector(state => state.session.activeCampaignId || '');
  const tabs = useSelector(state => state.project.present.viewOrder || []);
  const tabData = useSelector(state => state.project.present.views || {});
  const btnRef = useRef();
  const dropupRef = useRef();

  // When overview menu is opened, start scroll at the bottom
  useEffect(() => {
    if (showOverviewDropup && dropupRef?.current) {
      dropupRef.current.scrollTop = dropupRef.current.scrollHeight;
    }
  }, [showOverviewDropup]);

  useOutsideClick(
    [btnRef, dropupRef],
    showOverviewDropup,
    () => setShowOverviewDropup(false),
  );

  return {
    newTab: () => {
      if (!!activeProject) {
        dispatch(actions.project.createTab());
      }
    },
    btnRef,
    dropupRef,
    showOverviewDropup,
    toggleOverviewDropup: () => {
      if (!!activeProject) {
        if (showOverviewDropup) {
          setShowOverviewDropup(false);
        } else {
          setShowOverviewDropup(true);
        }
      } else {
        setShowOverviewDropup(false);
      }
    },
    tabs,
    tabData,
    switchTab: (id) => {
      scrollTo(id);
      dispatch(actions.project.updActiveTab({ id }));
      setShowOverviewDropup(false);
    },
  };
};

export const useTabHooks = ({
  id,
  setDropIndicatorIndex,
}) => {
  const dispatch = useDispatch();
  const [ isDragging, setIsDragging ] = useState(false);
  const [ titleValue, setTitleValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const [ showTabMenuDropup, setShowTabMenuDropup ] = useState(false);
  const activeTab = useSelector(state => state.project.present.activeViewId || '');
  const tabOrder = useSelector(state => state.project.present.viewOrder || []);
  const tab = useSelector(state => state.project.present.views[id] || {});
  let rndRef = useRef();
  const titleRef = useRef();
  const dropUpBtnRef = useRef();

  const isActiveTab = id === activeTab;
  const isOnlyTab = tabOrder.length === 1;
  const tabIndex = tabOrder.indexOf(id);

  // Initialize title value
  useEffect(() => {
    setTitleValue(tab.title);
  }, [tab]);

  // Set visual position of tab when tabOrder changes
  useEffect(() => {
    rndRef.updatePosition({
      x: tabIndex * POSITION_INCREMENT,
      y: 0,
    });
  }, [tabOrder]);

  const beginTitleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
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
      dispatch(actions.project.updateTabTitle({ id, title: titleValue }));
      setIsEditing(false);
    }
  };

  const handleTitleKeyPress = (event) => {
    if(event.key === 'Enter' || event.key === 'Tab') {
      endTitleEdit();
    }
  };

  const dropUpOptions = [
    {
      title: 'Delete',
      type: isOnlyTab ? ACTION_TYPE.disabled : ACTION_TYPE.danger,
      // icon: RedTrashIcon,
      callback: () => {
        if (!isOnlyTab) {
          dispatch(actions.session.setPopup({ type: POPUP_KEYS.confirmTabDelete, id }));
        }
      },
    },
    {},
    {
      title: 'Move left',
      type: tabIndex === 0 ? ACTION_TYPE.disabled : null,
      callback: () => {
        if (tabIndex > 0) {
          dispatch(actions.project.shiftTabBy({ id, position: -1 }));
        }
      },
    },
    {
      title: 'Move right',
      type: tabIndex === tabOrder.length-1 ? ACTION_TYPE.disabled : null,
      callback: () => {
        if (tabIndex < tabOrder.length-1) {
          dispatch(actions.project.shiftTabBy({ id, position: 1 }));
        }
      }
    },
    {},
    {
      title: 'Rename',
      callback: () => beginTitleEdit(),
    },
    // {
    //   title: 'Duplicate tab',
    //   callback: () => {},
    // },
  ];

  return {
    setRndRef: node => rndRef = node,
    isActiveTab,
    switchTab: () => dispatch(actions.project.updActiveTab({ id })),
    isDragging,
    onDrag: (event, data) => {
      const initialX = tabIndex * POSITION_INCREMENT;
      if (initialX - data.x > POSITION_INCREMENT / 2) {
        setDropIndicatorIndex(Math.round(data.x / POSITION_INCREMENT));
      } else if (initialX - data.x < -POSITION_INCREMENT / 2) {
        setDropIndicatorIndex(Math.round(data.x / POSITION_INCREMENT) + 1);
      } else {
        setDropIndicatorIndex(null);
      }
    },
    onDragStart: () => setIsDragging(true),
    onDragStop: (event, data) => {
      const initialX = tabIndex * POSITION_INCREMENT;
      const deltaIndex = Math.round((data.x - initialX) / POSITION_INCREMENT);
      if (deltaIndex !== 0) {
        dispatch(actions.project.shiftTabBy({ id, position: deltaIndex }));
      } else {
        rndRef.updatePosition({
          x: initialX,
          y: 0,
        });
      }
      setIsDragging(false);
      setDropIndicatorIndex(null);
    },
    
    titleRef,
    titleValue,
    readOnly: !isEditing,
    inputClassName: isEditing ? 'editing' : '',
    changeTitleValue: (newValue) => setTitleValue(newValue),
    beginTitleEdit,
    endTitleEdit,
    handleTitleKeyPress,

    dropUpBtnRef,
    showTabMenuDropup,
    openTabMenuDropup: (event) => {
      if (event) {
        event.stopPropagation();
      }
      // containerRef.current.className = 'tab-container stopped';
      setShowTabMenuDropup(true)
    },
    closeTabMenuDropup: (event) => {
      if (event) {
        event.stopPropagation();
      }
      // containerRef.current.className = 'tab-container';
      setShowTabMenuDropup(false)
    },
    dropUpOptions,
  };
};
