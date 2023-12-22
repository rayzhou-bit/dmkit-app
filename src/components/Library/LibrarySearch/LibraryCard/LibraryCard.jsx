import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useOutsideClick } from "../../../../utils/useOutsideClick";

import "./LibraryCard.scss";
import * as actions from "../../../../store/actionIndex";
import { CARD_FONT_SIZE } from "../../../../shared/constants/fontSize";
import { CARD_TITLEBAR_COLORS } from "../../../../shared/constants/colors";
import TitleInput from "../../../UI/Inputs/TitleInput";
import Title from "../../../Card/Title";
import ContentTextarea from "../../../UI/Inputs/ContentTextarea";

import DeleteImg from "../../../../assets/icons/delete-24.png";

const LibraryCard = (props) => {
  const { cardId } = props;
  const dispatch = useDispatch();

  // STATES
  const [isSelected, setIsSelected] = useState(false);
  const [openColorSelect, setOpenColorSelect] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingCard, setEditingCard] = useState(false);
  const [cardAnimation, setCardAnimation] = useState({});

  // STORE SELECTORS
  const activeCardId = useSelector(
    (state) => state.sessionManager.activeCardId
  );
  const activeViewId = useSelector(
    (state) => state.campaignData.present.activeViewId
  );
  const cardViews = useSelector(
    (state) => state.campaignData.present.cards[cardId].views
  );
  const cardColor = useSelector(
    (state) => state.campaignData.present.cards[cardId].color
  );
  const cardTitle = useSelector(
    (state) => state.campaignData.present.cards[cardId].title
  );
  const cardText = useSelector(
    (state) => state.campaignData.present.cards[cardId].content.text
  );

  // REFS
  const libraryCardRef = useRef();
  const colorSelectRef = useRef();
  const colorBtnRef = useRef();
  const deleteBtnRef = useRef();

  // FUNCTIONS: CARD
  const cardDragStartHandler = (event) =>
    event.dataTransfer.setData("text", cardId);
  const cardDragEndHandler = () => {
    if (cardViews[activeViewId]) {
      setCardAnimation({
        ...cardAnimation,
        [cardId]: "library-card-blink .25s step-end 3 alternate",
      });
    }
  };

  const onAnimationEnd = () => {
    setCardAnimation({
      ...cardAnimation,
      [cardId]: null,
    });
  };

  const cardClickHandler = () => {
    if (!isSelected) {
      if (cardId !== activeCardId) dispatch(actions.updActiveCardId(cardId));
      setIsSelected(true);
    }
  };

  useOutsideClick([libraryCardRef], isSelected, () => {
    if (cardId === activeCardId) dispatch(actions.updActiveCardId(null));
    setIsSelected(false);
  });

  // FUNCTIONS: TITLEBAR
  useOutsideClick([colorSelectRef, colorBtnRef], openColorSelect, () =>
    setOpenColorSelect(false)
  );

  useOutsideClick([deleteBtnRef], confirmDelete, () => setConfirmDelete(false));

  const deleteCard = () => {
    if (!confirmDelete) setConfirmDelete(true);
    else dispatch(actions.destroyCard(cardId));
  };

  // STYLES: CARD
  const cardStyle = {
    margin: cardId === activeCardId ? "0px 0px 8px 0px" : "2px 2px 10px 2px",
    zIndex: cardId === activeCardId ? "100" : "0",
    animation: cardAnimation ? cardAnimation[cardId] : null,
  };

  // STYLES: CONTENT
  const contentContainerStyle = {
    minHeight: isSelected
      ? 6 * CARD_FONT_SIZE.text + "px"
      : 3 * CARD_FONT_SIZE.text + "px",
    maxHeight: isSelected ? "50vh" : 5 * CARD_FONT_SIZE.text + "px",
    height: isSelected ? "35vh" : 5 * CARD_FONT_SIZE.text + "px",
  };

  return (
    <div
      ref={libraryCardRef}
      className="library-card"
      style={cardStyle}
      draggable={!editingCard}
      onDragStart={cardDragStartHandler}
      onDragEnd={cardDragEndHandler}
      onClick={cardClickHandler}
      onAnimationEnd={onAnimationEnd}
    >
      <div className="library-border">
        <Title
          cardId={cardId}
          color={cardColor}
          setEditingCard={editingCard}
          title={cardTitle}
        />
        {/* content */}
        <div
          className="library-card-content-container"
          style={contentContainerStyle}
        >
          <ContentTextarea
            className="library-card-textarea"
            isSelected={isSelected}
            lib={true}
            value={cardText}
            saveValue={(v) => dispatch(actions.updCardText(cardId, v))}
            setEditingParent={setEditingCard}
          />
        </div>
      </div>
    </div>
  );
};

export default LibraryCard;
