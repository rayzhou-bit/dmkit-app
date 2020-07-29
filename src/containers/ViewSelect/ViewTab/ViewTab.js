import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './ViewTab.scss';
import * as actions from '../../../store/actionIndex';
import { useOutsideClick } from '../../../shared/utilityFunctions';

const ViewTab = React.memo((props) => {
  const dispatch = useDispatch();

  const [editingTitle, setEditingTitle] = useState(false);

  const viewColl = useSelector(state => state.view);
  const activeView = useSelector(state => state.viewManage.activeView);

  const viewId = props.id;
  const viewData = viewColl[viewId];
  const viewTitle = viewData.title ? viewData.title : "untitled";
  const viewTitleRef = useRef(viewId+"title");

  const setViewDelete = (view) => dispatch(actions.setViewDelete(view));
  const onClickView = (view) => dispatch(actions.onClickView(view));

  const enterHandler = (event) => {
    if (event.which === 13) {
      dispatch(actions.updViewTitle(viewId, viewTitleRef.current.value));
      setEditingTitle(false);
    }
  };

  const outsideClickFunc = () => {
    dispatch(actions.updViewTitle(viewId, viewTitleRef.current.value));
    setEditingTitle(false);
  };
  useOutsideClick(viewTitleRef, editingTitle, outsideClickFunc);

  return (
    <div 
      className="viewTab" onClick={viewId === activeView ? null : () => onClickView(viewId)}
      style={viewId === activeView ? {backgroundColor: "lightskyblue"} : null}
    >
      <input
        ref={viewTitleRef}
        className="title"
        style={viewId === activeView ? {backgroundColor: "lightskyblue"} : null}
        onDoubleClick={() => setEditingTitle(true)}
        onKeyUp={editingTitle ? (event) => enterHandler(event) : null}
        defaultValue={viewTitle}
        readOnly={!editingTitle}
        type="text"
        required
      />
      <button 
        className="viewButton"
        style={viewId === activeView ? {backgroundColor: "lightskyblue"} : null}
      >
        C
      </button>
      <button 
        className="viewButton" 
        style={viewId === activeView ? {backgroundColor: "lightskyblue"} : null}
        onClick={() => setViewDelete(viewId)}
      >
        X
      </button>
    </div>
  );
});

export default ViewTab;