import {useEffect} from 'react';

export const useOutsideClick = (refs, condition, handler) => {
  // refs contains an array of references that the user can click without triggering func
  useEffect(() => {
    const handleClickOutside = (event) => {
      let runHandler = true;
      refs.forEach(ref => {
        if (ref.current && ref.current.contains(event.target)) {
          runHandler = false;
        }
      });
      
      if (runHandler && refs.length > 0) {
        handler();
      }
    };

    if (condition) {
      document.addEventListener("mouseup", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };

    // adding refs and handler as dependencies below causes an issue with re-renders
    // these re-renders keep other useOutsideClicks from completing their run
    // TODO figure out a way around this for exhaustive-deps
  }, [condition]);
};

export default useOutsideClick;