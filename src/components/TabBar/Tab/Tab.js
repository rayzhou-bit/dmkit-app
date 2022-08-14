import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rnd } from 'react-rnd';
import { useOutsideClick } from '../../../shared/utils';

import './Tab.scss';
import * as actions from '../../../store/actionIndex';
import Menu from '../../UI/Menu/Menu';

import OpenMenuImg from '../../../assets/icons/drop-down-dark.png';

const Tab = React.memo(props => {
  const {viewId, tabWidth} = props;
  const dispatch = useDispatch();

  // STATES
  const [dragging, setDragging] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  // STORE SELECTORS
  const activeViewId = useSelector(state => state.campaignData.present.activeViewId);
  const viewOrder = useSelector(state => state.campaignData.present.viewOrder);
  const viewPos = viewOrder.indexOf(viewId);
  const viewTitle = useSelector(state => state.campaignData.present.views[viewId].title);

  // REF
  let rndRef = useRef();
  const titleRef = useRef();
  const showMenuBtnRef = useRef();
  const menuRef = useRef();

  // FUNCTIONS: VIEWTAB DRAG
  useEffect(() => {
    rndRef.updatePosition({x: viewPos*tabWidth, y: 0});
  }, [viewOrder]);

  const dragStopHandler = (event, data) => {
    const posShift = Math.round((data.x - (viewPos*tabWidth)) / tabWidth);
    if (posShift !== 0) dispatch(actions.shiftViewInViewOrder(viewId, posShift));
    else rndRef.updatePosition({x: viewPos*tabWidth, y: 0});
    setDragging(false);
  };

  // FUNCTIONS: EDIT TITLE
  useEffect(() => {
    setTitleValue(viewTitle);
  }, [setTitleValue, viewTitle]);

  const beginEditTitle = (event) => {
    if (!editingTitle) {
      setEditingTitle(true);
      titleRef.current.focus();
      titleRef.current.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length);
    }
  };

  const endEditTitle = (event) => {
    if (editingTitle) {
      document.getSelection().removeAllRanges();
      if (titleValue !== viewTitle) dispatch(actions.updViewTitle(viewId, titleValue));
      setEditingTitle(false);
    }
  };

  const keyPressHandlerTitle = (event) => {
    if (editingTitle) {
      if (event.key === 'Enter' || event.key === 'Tab') endEditTitle();
    }
  };

  // FUNCTIONS: MENU
  useOutsideClick([showMenuBtnRef, menuRef], showMenu, 
    () => setShowMenu(false)
  );

  const destroyView = (event) => {
    event.stopPropagation();
    dispatch(actions.destroyView(viewId));
  };
  
  // STYLES
  const toFrontStyle = {
    zIndex: dragging ? 11 : (viewId===activeViewId) ? 10 : 1,
    height: "100%"
  };

  const inputStyle = {
    userSelect: editingTitle ? "default" : "none",
    MozUserSelect: editingTitle ? "default" : "none",
    WebkitUserSelect: editingTitle ? "default" : "none",
    msUserSelect: editingTitle ? "default" : "none",
    cursor: editingTitle ? "text" : "move",
  };

  return (
    <Rnd 
      ref={node => rndRef = node}
      style={toFrontStyle}
      bounds="parent"
      // position
      // drag
      disableDragging={editingTitle}
      dragHandleClassName="title-input" dragAxis="x"
      onDragStart={()=>setDragging(true)}
      onDragStop={dragStopHandler}
      // size
      size={{width: tabWidth, height: 32}}
      // resize
      enableResizing={false}
      // onClick
      // onClick={(viewId !== activeViewId) ? () => dispatch(actions.updActiveViewId(viewId)) : null}
    >
      <div className={(viewId === activeViewId) ? "active-tab view-tab" : "inactive-tab view-tab"}
        style={{gridTemplateColumns: `${tabWidth-30}px 30px`}}>
        <input ref={titleRef} className="title-input" style={inputStyle}
          type="text" required maxLength="20"
          value={titleValue ? titleValue : ""} title={titleValue ? titleValue : ""} readOnly={!editingTitle}
          onClick={(viewId !== activeViewId) ? () => dispatch(actions.updActiveViewId(viewId)) : null}
          onDoubleClick={beginEditTitle}
          onBlur={endEditTitle}
          onChange={e => setTitleValue(e.target.value)}
          onKeyDown={keyPressHandlerTitle}
          onDragOver={e => e.preventDefault()}
        />
        <button ref={showMenuBtnRef} className="menu-btn btn-24"
          onClick={() => setShowMenu(!showMenu)}>
          <img src={OpenMenuImg} alt="Delete" draggable="false" />
          <div ref={menuRef} className="option-menu" 
            style={{display: showMenu ? "block" : "none"}}>
            <Menu options={[
                ["Rename", beginEditTitle],
                // ["Duplicate tab", beginEditTitle], TODO!
                ["divider"],
                ["Delete tab", destroyView, 'red'],
              ]} />
          </div>
        </button>
      </div>
    </Rnd>
  );
});

export default Tab;
