export const colors = {
  BLACK: '#000000de',
  WHITE: '#ffffff'
};

export const getFontColorByBackgroundColor = backgroundColorHex => {
  let color = colors.BLACK;

  let rgbColor = hexToRgb(backgroundColorHex);
  if (rgbColor && rgbColor !== null) {
    var r = rgbColor.r;
    var g = rgbColor.g;
    var b = rgbColor.b;

    //http://www.w3.org/TR/AERT#color-contrast
    var o = Math.round((parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000);
    color = o > 125 ? colors.BLACK : colors.WHITE;
  }
  return color;
};

export const hexToRgb = hex => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
};
