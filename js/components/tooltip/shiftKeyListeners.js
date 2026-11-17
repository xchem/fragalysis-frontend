const listeners = new Set();
let shiftPressed = false;

const onKeyDown = event => {
  if (event.key !== 'Shift') return;
  shiftPressed = true;
  [...listeners].forEach(listener => listener.onKeyDown(event));
};

const onKeyUp = event => {
  if (event.key !== 'Shift') return;
  shiftPressed = false;
  [...listeners].forEach(listener => listener.onKeyUp(event));
};

export const isTooltipShiftPressed = () => shiftPressed;

export const subscribeToTooltipShiftKeys = listener => {
  if (listeners.size === 0) {
    window.addEventListener('keydown', onKeyDown, { passive: true });
    window.addEventListener('keyup', onKeyUp, { passive: true });
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      shiftPressed = false;
    }
  };
};
