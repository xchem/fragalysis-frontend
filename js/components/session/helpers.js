export const updateClipboard = valueToClipboard => {
  navigator.clipboard.writeText(valueToClipboard);
};
