import {useEffect} from 'react';

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const useOutsideClick = (ref, cond, func, args, optionalRef) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionalRef) {
        if (ref.current && !ref.current.contains(event.target) && !optionalRef.current.contains(event.target)) {
          func(args);
        }
      } else {
        if (ref.current && !ref.current.contains(event.target)) {
          func(args);
        }
      }
    };

    if (cond) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cond]);
};