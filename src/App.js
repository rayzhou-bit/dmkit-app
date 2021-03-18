import React, { useRef } from 'react';

import './App.scss';
import Loader from './components/Loader/Loader';
import UserMenu from './components/UserMenu/UserMenu';
import ToolMenu from './components/ToolMenu/ToolMenu';
import Library from './components/Library/Library';
import ViewSelect from './components/ViewSelect/ViewSelect';
import ViewScreen from './components/ViewScreen/ViewScreen';

const App = props => {
  // REFS
  const toolMenuRef = useRef("toolMenu");

  // Disable scrolling
  document.body.scroll = "no";
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  return (
    <div className="layout">
      <Loader />
      <UserMenu />
      <ToolMenu toolMenuRef={toolMenuRef} />
      <Library />
      <ViewSelect />
      <ViewScreen toolMenuRef={toolMenuRef} />
    </div>
  );
};

export default App;
