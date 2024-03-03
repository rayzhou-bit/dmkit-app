import React, { useRef, useState } from 'react';

import './App.scss';
import Loader from './components/Loader/Loader';
import HeaderMenu from './components/HeaderMenu';
import ToolMenu from './components/ToolMenu';
import Library from './components/Library/Library';
import TabBar from './components/TabBar';
import Canvas from './components/Canvas';
import Popup from './components/Popup';

const App = () => {
  const [ isToolMenuOpen, setIsToolMenuOpen ] = useState(true);
  const toolMenuRef = useRef();

  // Disable scrolling
  document.body.scroll = 'no';
  document.body.style.backgroundColor = 'gray';
  document.body.style.overflow = 'hidden';
  document.height = window.innerHeight;

  return (
    <div className='layout'>
      <Loader />
      <HeaderMenu isToolMenuOpen={isToolMenuOpen} toggleToolMenu={() => setIsToolMenuOpen(!isToolMenuOpen)} />
      <ToolMenu toolMenuRef={toolMenuRef} isOpen={isToolMenuOpen} />
      <Library />
      <TabBar />
      <Canvas toolMenuRef={toolMenuRef} />
      <Popup />
    </div>
  );
};

export default App;
