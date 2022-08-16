import { 
  useDispatch,
  useEffect,
  useState,
} from 'react';

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const useOutsideClick = (refArray, conditional, handler) => {
  // Note: I've tried to update this syntax but this just works.
  // refArray contains an array of references that the user can click without triggering func
  useEffect(() => {
    const handleClickOutside = (event) => {
      let run = true;
      for (let i = 0; i < refArray.length && run; i++) {
        let ref = refArray[i];
        if (ref.current && ref.current.contains(event.target)) {
          run = false;
        }
      }
      
      if (run && refArray.length > 0) {
        handler();
      }
    };

    if (conditional) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

    // adding refArray and handler as dependencies below causes an issue with re-renders
    // these re-renders keep other useOutsideClicks from completing their run
    // TODO figure out a way around this for exhaustive-deps
  }, [conditional]);
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

export const statBlockParser = (text) => {
  let statBlock;
  return statBlock;
};