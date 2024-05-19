import {useEffect} from 'react';

export const useOutsideClick = (refs, condition, handler) => {
  // refs contains an array of references that the user can click without logginging func
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

    // adding refs and handler as dependencies below causes an issue with re-renders
    // these re-renders keep other useOutsideClicks from completing their run
  }, [condition]);
};

export default useOutsideClick;