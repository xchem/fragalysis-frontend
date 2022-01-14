import { useCallback, useState } from 'react';

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

  const changeDisableMap = useCallback((type, value) => {
    setDisableMap(prevState => ({ ...prevState, [type]: value }));
  }, []);

  const withDisabledNglControlButton = useCallback(
    async (type, callback) => {
      changeDisableMap(type, true);

      await callback();

      changeDisableMap(type, false);
    },
    [changeDisableMap]
  );

  return [disableMap, withDisabledNglControlButton];
};

export default useDisableNglControlButtons;
