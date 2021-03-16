import {useEffect} from 'react';

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const useOutsideClick = (refArray, cond, handler) => {
  // refArray contains an array of references that the user can click without triggering func
  useEffect(() => {
    const handleClickOutside = (event) => {
      let runHandler = true;
      for (let i = 0; i < refArray.length && runHandler; i++) {
        const ref = refArray[i];
        if (ref.current && ref.current.contains(event.target)){
          runHandler = false;
        }
      }
      
      if (runHandler && refArray.length > 0) {
        handler();
      }
    };

    if (cond) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

    // adding refArray and handler as dependencies below causes an issue with re-renders
    // these re-renders keep other useOutsideClicks from completing their run
    // TODO figure out a way around this for exhaustive-deps
  }, [cond]);
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