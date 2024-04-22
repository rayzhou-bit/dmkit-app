import React from 'react';

import './App.scss';
import HeaderMenu from './components/HeaderMenu';
import ToolMenu from './components/ToolMenu';
import Library from './components/Library';
import TabBar from './components/TabBar';
import Canvas from './components/Canvas';
import Popup from './components/Popup';

import { useListenerHooks, useMenuStateHooks } from './hooks';

const App = () => {
  useListenerHooks();
  const {
    toolMenuRef,
    isToolMenuOpen,
    toggleToolMenu,
  } = useMenuStateHooks();

  // Disable scrolling
  document.body.scroll = 'no';
  document.body.style.backgroundColor = 'gray';
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  return (
    <div className='layout'>
      <HeaderMenu
        isToolMenuOpen={isToolMenuOpen}
        toggleToolMenu={toggleToolMenu} />
      <ToolMenu toolMenuRef={toolMenuRef} isOpen={isToolMenuOpen} />
      <Library />
      <TabBar />
      <Canvas toolMenuRef={toolMenuRef} />
      <Popup />
    </div>
  );
};

export default App;
