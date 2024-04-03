import * as actionTypes from '../actionTypes';

// actions for sessionManager reducer

// actions for campaingData reducer
export const updActiveViewId = (activeViewId) => { return { type: actionTypes.UPD_ACTIVE_VIEW_ID, activeViewId: activeViewId }; };
export const shiftViewInViewOrder = (shiftedViewId, posShift) => { return { type: actionTypes.SHIFT_VIEW_IN_VIEW_ORDER, shiftedViewId: shiftedViewId, posShift: posShift }; };
export const createView = () => { return { type: actionTypes.CREATE_VIEW }; };
export const destroyView = (viewId) => { return { type: actionTypes.DESTROY_VIEW, viewId: viewId }; };
export const lockActiveView = () => { return { type: actionTypes.LOCK_ACTIVE_VIEW }; };
export const unlockActiveView = () => { return { type: actionTypes.UNLOCK_ACTIVE_VIEW }; };
export const updActiveViewPos = (pos) => { return { type: actionTypes.UPD_ACTIVE_VIEW_POS, pos: pos }; };
export const updActiveViewScale = (scale) => { return { type: actionTypes.UPD_ACTIVE_VIEW_SCALE, scale: scale }; };
export const resetActiveView = () => { return { type: actionTypes.RESET_ACTIVE_VIEW }; };
export const updViewColor = (viewId, color) => { return { type: actionTypes.UPD_VIEW_COLOR, viewId: viewId, color: color }; };
export const updViewTitle = (viewId, title) => { return { type: actionTypes.UPD_VIEW_TITLE, viewId: viewId, title: title }; };