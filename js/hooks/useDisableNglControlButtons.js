import { useCallback, useRef, useState } from 'react';

/**
 * A hook which deduplicates logic of disabling an NGL control button (f.e. L, P, C, ...) while NGL is loading a particular
 * element into the viewer.
 */
const useDisableNglControlButtons = () => {
  /**
   * Disable map is an object which contains boolean values corresponding to each button. Example:
   * {
   *   ligand: false,
   *   protein: false,
   *   complex: false,
   * }
   */
  const [disableMap, setDisableMap] = useState({});
  /**
   * The counter keeps track of how many requests there have been to lock buttons. It's used to prevent the buttons
   * from being enable before all async functions resolve for a particular button.
   */
  const counter = useRef({});

  const changeDisableMap = useCallback((type, value) => {
    setDisableMap(prevState => ({ ...prevState, [type]: value }));
  }, []);

  const disableType = useCallback(
    type => {
      if (!counter.current[type]) {
        changeDisableMap(type, true);
      }
      counter.current[type] = (counter.current[type] || 0) + 1;
    },
    [changeDisableMap]
  );

  const enableType = useCallback(
    type => {
      counter.current[type] = counter.current[type] - 1;
      if (!counter.current[type]) {
        changeDisableMap(type, false);
      }
    },
    [changeDisableMap]
  );

  const withDisabledNglControlButton = useCallback(
    async (type, callback) => {
      disableType(type);

      await callback();

      enableType(type);
    },
    [disableType, enableType]
  );

  return [disableMap, withDisabledNglControlButton];
};

export default useDisableNglControlButtons;
