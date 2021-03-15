import * as actionTypes from '../actionTypes';

// actions for sessionManager reducer

// actions for campaingData reducer
export const updActiveCardId = (activeCardId) => { return { type: actionTypes.UPD_ACTIVE_CARD_ID, activeCardId: activeCardId }; };

export const createCard = () => { return { type: actionTypes.CREATE_CARD }; };
export const copyCard = (cardId) => { return { type: actionTypes.COPY_CARD, cardId: cardId }; };
export const destroyCard = (cardId) => { return { type: actionTypes.DESTROY_CARD, cardId: cardId }; };
export const linkCardToView = (cardId, pos) => { return { type: actionTypes.LINK_CARD_TO_VIEW, cardId: cardId, pos: pos }; };
export const unlinkCardFromView = (cardId) => { return { type: actionTypes.UNLINK_CARD_FROM_VIEW, cardId: cardId }; };

export const updCardPos = (cardId, pos) => { return { type: actionTypes.UPD_CARD_POS, cardId: cardId, pos: pos }; };
export const updCardSize = (cardId, size) => { return { type: actionTypes.UPD_CARD_SIZE, cardId: cardId, size: size }; };
export const updCardColor = (cardId, color) => { return { type: actionTypes.UPD_CARD_COLOR, cardId: cardId, color: color }; };
export const updCardColorForView = (cardId, color) => { return { type: actionTypes.UPD_CARD_COLOR_FOR_VIEW, cardId: cardId, color: color }; };
export const updCardForm = (cardId, cardForm) => { return { type: actionTypes.UPD_CARD_FORM, cardId: cardId, cardForm: cardForm }; };

export const updCardTitle = (cardId, title) => { return { type: actionTypes.UPD_CARD_TITLE, cardId: cardId, title: title }; };
export const updCardText = (cardId, text) => { return { type: actionTypes.UPD_CARD_TEXT, cardId: cardId, text: text }; };
