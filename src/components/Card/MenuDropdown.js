import React from 'react';

const MenuDropdown = () => {

  return (
    <div ref={optionMenuRef} className="option-menu"
      style={{display: showOptionMenu ? "block" : "none"}}>
      <Menu options={[
        ["Rename", beginTitleEdit],
        ["divider"],
        ["Duplicate card", () => dispatch(actions.copyCard(cardId))],
        ["Shrink card", () => dispatch(actions.updCardForm(cardId, "blurb"))],
        ["divider"],
        ["Remove card", () => dispatch(actions.unlinkCardFromView(cardId)), 'red'],
        // ["Bring to front"], TODO!
        // ["Send to back"], TODO!
      ]} />
    </div>
  );
};

export default MenuDropdown;