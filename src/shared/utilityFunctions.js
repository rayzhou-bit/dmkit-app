import {useEffect} from 'react';

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const useOutsideClick = (refArray, cond, func, args) => {
  // refArray contains an array of references that the user can click without triggering func
  useEffect(() => {
    const handleClickOutside = (event) => {
      let runFunc = true;
      for (let i = 0; i < refArray.length && runFunc; i++) {
        const ref = refArray[i];
        if (ref.current && ref.current.contains(event.target)){
          runFunc = false;
        }
      }
      
      if (runFunc && refArray.length > 0) {
        func(args)
      }
    };

    if (cond) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

    // adding refArray as a dependency below causes an issue with re-renders
    // these re-renders keep other useOutsideClicks from completing their run
  }, [cond, func, args]);
};