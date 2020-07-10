import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./ViewTab.scss";
import * as actions from "../../../store/actionIndex";

const useOutsideClickSave = (ref, user, campaign, viewId, editing, setEditting) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && editing) {
        dispatch(actions.saveViewTitle(user, campaign, viewId, ref.current.value));
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

  const user = useSelector((state) => state.campaign.user);
  const campaign = useSelector((state) => state.campaign.campaign);
  const views = useSelector((state) => state.views.views);
  const viewOrder = useSelector((state) => state.views.viewOrder);
  const activeView = useSelector((state) => state.views.activeView);

  const removeView = (viewId) => dispatch(actions.removeView(user, campaign, viewOrder, viewId));
  const onClickView = (viewId) => dispatch(actions.onClickView(user, campaign, activeView, viewId));

  const enterHandler = (event, viewId, newTitle) => {
    if (event.which === 13 && editing) {
      dispatch(actions.saveViewTitle(user, campaign, viewId, newTitle));
      setEditting(false);
    }
  };

  const view = views[props.id];
  const tabInputRef = useRef(props.id);
  useOutsideClickSave(tabInputRef, user, campaign, props.id, editing, setEditting);

  let viewTitle = "untitled";
  if (view.title) {
    viewTitle = view.title
  }

  return (
    <div className="viewTab" onClick={props.id === activeView ? null : () => onClickView(props.id)}>
      <input
        ref={tabInputRef}
        onChange={editing ? null : () => setEditting(true)}
        onKeyUp={
          props.id === activeView
            ? (event) => enterHandler(event, props.id, tabInputRef.current.value)
            : null
        }
        defaultValue={viewTitle}
        readOnly={props.id !== activeView}
        type="text"
        required
      />
      <button onClick={() => removeView(props.id)}>X</button>
    </div>
  );
});

export default ViewTab;
