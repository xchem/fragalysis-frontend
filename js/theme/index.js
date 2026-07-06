import { createTheme } from '@material-ui/core/styles';
import palette from './palette';

export const getTheme = () => {
  return createTheme({
    palette,
    zIndex: {
      appBar: 1200,
      drawer: 1100
    },
    typography: {
      fontSize: 12
    },
    props: {
      MuiTooltip: {
        enterDelay: 1000,
        enterNextDelay: 1000
      }
    },
    overrides: {
      MuiTooltip: {
        tooltip: {
          fontSize: '0.9em'
        }
      }
    }
  });
};
