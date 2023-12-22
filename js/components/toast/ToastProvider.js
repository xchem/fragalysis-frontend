import React, { memo } from 'react';
import { Button, IconButton, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { ToastContext } from './ToastContext';
import { SnackbarProvider, closeSnackbar, enqueueSnackbar } from 'notistack';
import { base_url } from '../routes/constants';

/**
 * https://notistack.com/
 * https://mui.com/material-ui/react-snackbar/
 */
export const ToastProvider = memo(props => {
  const defaultOptions = {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'center'
    },
    /*style: {
      backgroundColor: pickRandom(['#ff71cc', '#ceff33', '#07d3fc']),
      color: pickRandom(['#fff', '#000'])
    },*/
    autoHideDuration: 60000,
    action: snackbarId => (
      <IconButton key="close" aria-label="close" color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Close />
      </IconButton>
    )
  };

  const toast = (text, options = {}) => {
    if (text && options) {
      enqueueSnackbar(text, { ...defaultOptions, ...options });
    }
  };

  const toastSuccess = (text, options = {}) => {
    const successOptions = {
      variant: 'success'
    };
    const message = options.link ? (
      <>
        <Typography>{text}</Typography>{' '}
        <Button
          color="primary"
          onClick={() => {
            options.link.linkAction(...options.link.linkParams);
          }}
        >
          {options.link.linkText}
        </Button>
      </>
    ) : (
      { text }
    );
    toast(message, { ...successOptions, ...options });
    // toast(text, { ...successOptions, ...options });
  };

  const toastError = (text, options = {}) => {
    const errorOptions = {
      variant: 'error'
    };
    toast(text, { ...errorOptions, ...options });
  };

  const toastWarning = (text, options = {}) => {
    const warningOptions = {
      variant: 'warning'
    };
    toast(text, { ...warningOptions, ...options });
  };

  const toastInfo = (text, options = {}) => {
    const infoOptions = {
      variant: 'info'
    };
    toast(text, { ...infoOptions, ...options });
  };

  return (
    <ToastContext.Provider
      value={{
        toast,
        toastSuccess,
        toastError,
        toastWarning,
        toastInfo
      }}
    >
      {props.children}
      <SnackbarProvider maxSnack={5} />
    </ToastContext.Provider>
  );
});
