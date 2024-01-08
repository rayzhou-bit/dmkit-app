import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useOutsideClick from '../../utils/useOutsideClick';

import * as actions from '../../store/actionIndex';

import RedTrashIcon from '../../assets/icons/red-trash.png';
import { PopupKeys } from '../Popup/PopupKey';

// TAB_WIDTH handles both the styling and drag movement for tabs.
export const TAB_WIDTH = 200;
export const SCROLL_RATIO = 1.75;

export const useTabBarHooks = () => {
  const tabs = useSelector(state => state.campaignData.present.viewOrder || []);
  const [ position, setPosition ] = useState(0);
  const [ lockScroll, setLockScroll ] = useState(false);
  const containerRef = useRef();
  const totalTabWidth = tabs.length * (TAB_WIDTH + 1);
  const rightBoundary = 3*(TAB_WIDTH + 1) - totalTabWidth;
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
      const newPosition = position + (TAB_WIDTH + 1)*SCROLL_RATIO;
      if (newPosition < 0) {
        setPosition(position + (TAB_WIDTH + 1)*SCROLL_RATIO);
      } else {
        setPosition(0);
      }
    }
  };
  const scrollRight = () => {
    if (!lockScroll) {
      const newPosition = position - (TAB_WIDTH + 1)*SCROLL_RATIO;
      if (newPosition > rightBoundary) {
        setPosition(position - (TAB_WIDTH + 1)*SCROLL_RATIO);
      } else {
        setPosition(rightBoundary);
      }
    }
  };
  const scrollTo = (tabId) => {
    if (!lockScroll) {
      const tabPosition = tabs.indexOf(tabId) * (TAB_WIDTH + 1);
      const [ leftBound, rightBound ] = [
        -tabPosition,
        containerWidth() - (TAB_WIDTH + 1) - tabPosition,
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
  const activeTab = useSelector(state => state.campaignData.present.activeViewId || '');
  const tabs = useSelector(state => state.campaignData.present.viewOrder || []);
  const tabData = useSelector(state => state.campaignData.present.views || {});
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
    newTab: () => dispatch(actions.createView()),
    btnRef,
    dropupRef,
    showOverviewDropup,
    openOverviewDropup: () => setShowOverviewDropup(true),
    closeOverviewDropup: () => setShowOverviewDropup(false),
    activeTab,
    tabs,
    tabData,
    switchTab: (id) => {
      scrollTo(id);
      dispatch(actions.updActiveViewId(id));
      setShowOverviewDropup(false);
    },
  };
};

export const useTabHooks = ({
  id,
}) => {
  const dispatch = useDispatch();
  const [ isDragging, setIsDragging ] = useState(false);
  const [ titleValue, setTitleValue ] = useState('');
  const [ isEditing, setIsEditing ] = useState(false);
  const [ showTabMenuDropup, setShowTabMenuDropup ] = useState(false);
  const activeTab = useSelector(state => state.campaignData.present.activeViewId || '');
  const tabOrder = useSelector(state => state.campaignData.present.viewOrder || []);
  const tab = useSelector(state => state.campaignData.present.views[id] || {});
  let rndRef = useRef();
  const titleRef = useRef();
  const dropUpBtnRef = useRef();

  const isActiveTab = id === activeTab;
  const tabIndex = tabOrder.indexOf(id);

  // Initialize title value
  useEffect(() => {
    setTitleValue(tab.title);
  }, [tab]);

  // Set visual position of tab when tabOrder changes
  useEffect(() => {
    rndRef.updatePosition({
      x: tabIndex * (TAB_WIDTH + 1),
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
      dispatch(actions.updViewTitle(id, titleValue));
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
      type: 'danger',
      // icon: RedTrashIcon,
      callback: () => dispatch(actions.setPopup({
        type: PopupKeys.CONFIRM_TAB_DELETE,
        id,
      })),
    },
    {},
    {
      title: 'Move left',
      callback: () => {
        if (tabIndex > 0) {
          dispatch(actions.shiftViewInViewOrder(id, -1));
        }
      },
    },
    {
      title: 'Move right',
      callback: () => {
        if (tabIndex < tabOrder.length-1) {
          dispatch(actions.shiftViewInViewOrder(id, 1));
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
    switchTab: () => dispatch(actions.updActiveViewId(id)),
    isDragging,
    onDragStart: () => setIsDragging(true),
    onDragStop: (event, data) => {
      const initialX = tabIndex * (TAB_WIDTH + 1);
      const deltaIndex = Math.round((data.x - initialX) / TAB_WIDTH);
      if (deltaIndex !== 0) {
        dispatch(actions.shiftViewInViewOrder(id, deltaIndex));
      } else {
        rndRef.updatePosition({
          x: initialX,
          y: 0,
        });
      }
      setIsDragging(false);
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
