import { createTheme } from '@mui/material/styles';
import palette from './palette';

export const getTheme = () => {
  return createTheme({
    palette,
    zIndex: {
      appBar: 1100,
      drawer: 1200
    },
    typography: {
      fontSize: 12
    },
    components: {
      MuiButton: {
        defaultProps: {
          color: 'inherit'
        }
      },
      MuiCheckbox: {
        defaultProps: {
          color: 'secondary'
        }
      },
      MuiFormControl: {
        defaultProps: {
          variant: 'standard'
        }
      },
      MuiIconButton: {
        defaultProps: {
          size: 'large'
        }
      },
      MuiLink: {
        defaultProps: {
          underline: 'hover'
        }
      },
      MuiRadio: {
        defaultProps: {
          color: 'secondary'
        }
      },
      MuiSelect: {
        defaultProps: {
          variant: 'standard'
        }
      },
      MuiSwitch: {
        defaultProps: {
          color: 'secondary'
        }
      },
      MuiTabs: {
        defaultProps: {
          indicatorColor: 'secondary',
          textColor: 'inherit'
        }
      },
      MuiTextField: {
        defaultProps: {
          variant: 'standard'
        }
      },
      MuiTooltip: {
        defaultProps: {
          enterDelay: 1000,
          enterNextDelay: 1000
        },
        styleOverrides: {
          tooltip: {
            fontSize: '0.9em'
          }
        }
      }
    }
  });
};
