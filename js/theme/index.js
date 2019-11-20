import { createMuiTheme } from '@material-ui/core/styles';
import palette from './palette';

export const getTheme = () => {
  return createMuiTheme({
    palette,
    zIndex: {
      appBar: 1200,
      drawer: 1100
    },
    typography: {
      // overides from bootstrap config
      //  htmlFontSize: 16,
      fontSize: 9,
      fontFamily: '"Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif',
      subtitle2: {
        fontWeight: 600
      }
    }
  });
};
