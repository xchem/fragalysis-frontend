import React, { useMemo } from 'react';
import { makeStyles, TextField, InputAdornment } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import classNames from 'classnames';
import { debounce } from 'lodash';

const useStyles = makeStyles(theme => ({
  search: {
    fontSize: theme.typography.pxToRem(13),
    margin: `0 ${theme.spacing(1)}px`,
    '& .MuiInputBase-root': {
      color: theme.palette.white
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: theme.palette.white
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.white
    },
    '& :before': {
      bottom: -2
    },
    '& :after': {
      bottom: -2
    }
  },
  input: {
    height: '1em',
    padding: '4px 0 4px',
    fontSize: theme.typography.pxToRem(13)
  }
}));

const SearchField = ({ className, id, placeholder, size, onChange, disabled, searchString }) => {
  const classes = useStyles();
  let value = searchString ??  '';

  const debounced = useMemo(
    () =>
      debounce(value => {
        onChange(value);
      }, 1000),
    [onChange]
  );

  const onChangeDebounced = event => {
    const value = event.target.value || null;
    debounced(value);
  };

  return (
    <TextField
      className={classNames(classes.search, className)}
      id={id}
      placeholder={placeholder ?? 'Search'}
      size={size}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search color="inherit" />
          </InputAdornment>
        ),
        className: classes.input
      }}
      onChange={onChangeDebounced}
      disabled={disabled}
      defaultValue={value ?? ''}
    />
  );
};

export default SearchField;
