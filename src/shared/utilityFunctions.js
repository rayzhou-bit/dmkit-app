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
        func(args);
      }
    };

    if (cond) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

    // adding refArray and func as dependencies below causes an issue with re-renders
    // these re-renders keep other useOutsideClicks from completing their run
  }, [cond, args]);
};

export const getParameterByName = (name) => {
  // Sample action handle URL:
  // https://example.com/usermgmt?mode=resetPassword&oobCode=ABC123&apiKey=AIzaSy...&lang=fr

  let value = window.location.href;
  if (value) {
    value = value.split(name+"=")[1];
  }
  if (value) {
    value = value.split('&')[0];
  }

  return value;
};