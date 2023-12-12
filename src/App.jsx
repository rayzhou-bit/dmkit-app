import React, { useRef } from 'react';

import './App.scss';
import Loader from './components/Loader/Loader';
import HeaderMenu from './components/HeaderMenu';
import ToolMenu from './components/ToolMenu/ToolMenu';
import Library from './components/Library/Library';
import ViewSelect from './components/ViewSelect/ViewSelect';
import ViewScreen from './components/ViewScreen/ViewScreen';
import Popup from './components/Popup';

const App = () => {
  // REFS
  const toolMenuRef = useRef();

  // Disable scrolling
  document.body.scroll = "no";
  document.body.style.backgroundColor = 'gray';
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  return (
    <div className="layout">
      <Loader />
      <HeaderMenu />
      <ToolMenu toolMenuRef={toolMenuRef} />
      <Library />
      <ViewSelect />
      <ViewScreen toolMenuRef={toolMenuRef} />
      <Popup />
    </div>
  );
};

export default App;
