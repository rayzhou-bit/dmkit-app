import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";

const useOutsideClickSave = (ref, view, editing, setEditting) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && editing) {
        dispatch(actions.updViewTitle(view, ref.current.value));
        setEditting(false);
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [ref, editing]);
};

const ViewTab = React.memo((props) => {
  const dispatch = useDispatch();

  const [editing, setEditting] = useState(false);

  const viewColl = useSelector(state => state.view);
  const activeView = useSelector(state => state.viewManage.activeView);

  const viewId = props.id;
  const viewData = viewColl[viewId];
  const viewTitle = viewData.title ? viewData.title : "untitled";
  const viewTitleRef = useRef(viewId);

  const setViewDelete = (view) => dispatch(actions.setViewDelete(view));
  const onClickView = (view) => dispatch(actions.onClickView(view));

  const enterHandler = (event, view, newTitle) => {
    if (event.which === 13 && editing) {
      dispatch(actions.updViewTitle(view, newTitle));
      setEditting(false);
    }
  };

  useOutsideClickSave(viewTitleRef, viewId, editing, setEditting);

  return (
    <div className="viewTab" onClick={viewId === activeView ? null : () => onClickView(viewId)}>
      <input
        ref={viewTitleRef}
        onChange={editing ? null : () => setEditting(true)}
        onKeyUp={
          viewId === activeView
            ? (event) => enterHandler(event, viewId, viewTitleRef.current.value)
            : null
        }
        defaultValue={viewTitle}
        readOnly={viewId !== activeView}
        type="text"
        required
      />
      <button onClick={() => setViewDelete(viewId)}>X</button>
    </div>
  );
});

export default ViewTab;
