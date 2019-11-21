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
      fontSize: 12
    }
  });
};
