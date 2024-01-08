import React, { useRef } from 'react';

import './App.scss';
import Loader from './components/Loader/Loader';
import HeaderMenu from './components/HeaderMenu';
import ToolMenu from './components/ToolMenu/ToolMenu';
import Library from './components/Library/Library';
import TabBar from './components/TabBar';
import Canvas from './components/Canvas';
import Popup from './components/Popup';

const App = () => {
  // REFS
  const toolMenuRef = useRef();

  // Disable scrolling
  document.body.scroll = 'no';
  document.body.style.backgroundColor = 'gray';
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  return (
    <div className='layout'>
      <Loader />
      <HeaderMenu />
      <ToolMenu toolMenuRef={toolMenuRef} />
      <Library />
      <TabBar />
      <Canvas toolMenuRef={toolMenuRef} />
      <Popup />
    </div>
  );
};

export default App;
