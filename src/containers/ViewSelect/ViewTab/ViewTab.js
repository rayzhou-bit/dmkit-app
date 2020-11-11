import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";
import { useOutsideClick } from "../../../shared/utilityFunctions";

import SettingsButton from "../../../media/icons/adjust.svg";
import ClosingButton from "../../../media/icons/close.svg";

const ViewTab = React.memo((props) => {
  const dispatch = useDispatch();

  const [editingTitle, setEditingTitle] = useState(false);

  const viewColl = useSelector((state) => state.view);
  const activeView = useSelector((state) => state.viewManage.activeView);

  const viewId = props.id;
  const viewData = viewColl[viewId];
  const viewTitle = viewData.title ? viewData.title : "untitled";
  const viewTitleRef = useRef(viewId + "title");

  const setViewDelete = () => dispatch(actions.setViewDelete(viewId));
  const onClickView = () => dispatch(actions.onClickView(viewId));

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

  const activeViewStyle = {
    backgroundColor: "white",
    borderTop: "1px solid white",
  };

  return (
    <div
      className="viewTab"
      onClick={viewId === activeView ? null : onClickView}
      style={viewId === activeView ? activeViewStyle : null}
    >
      <input
        ref={viewTitleRef}
        className="title"
        style={viewId === activeView ? { backgroundColor: "white" } : null}
        onDoubleClick={() => setEditingTitle(true)}
        onKeyUp={editingTitle ? (event) => enterHandler(event) : null}
        defaultValue={viewTitle}
        readOnly={!editingTitle}
        type="text"
        required
      />
      <label className="titleBarButtons">
        <input
          type="image"
          src={SettingsButton}
          alt="Settings"
          style={viewId === activeView ? { backgroundColor: "white" } : null}
        />
      </label>
      <label className="titleBarButtons">
        <input
          type="image"
          src={ClosingButton}
          alt="Delete"
          style={viewId === activeView ? { backgroundColor: "white" } : null}
          onClick={setViewDelete}
        />
      </label>
    </div>
  );
});

export default ViewTab;
