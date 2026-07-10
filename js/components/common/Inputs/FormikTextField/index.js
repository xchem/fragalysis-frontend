import React from 'react';
import { getIn } from 'formik';
import { TextField } from '../../../../ui';

export const FormikTextField = ({ children, disabled, field, form, helperText, ...rest }) => {
  const fieldError = getIn(form.errors, field.name);
  const showError = Boolean(getIn(form.touched, field.name) && fieldError);

  return (
    <TextField
      {...rest}
      {...field}
      disabled={disabled ?? form.isSubmitting}
      error={showError}
      helperText={showError ? fieldError : helperText}
    >
      {children}
    </TextField>
  );
};
