import React, { useMemo } from 'react';
import { makeStyles, TextField, InputAdornment } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import classNames from 'classnames';
import { debounce } from 'lodash';

const useStyles = makeStyles(theme => ({
  search: {
    margin: theme.spacing(1),
    '& .MuiInputBase-root': {
      color: theme.palette.white
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: theme.palette.white
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: theme.palette.white
    }
  }
}));

const SearchField = ({ className, id, placeholder, size, onChange, disabled }) => {
  const classes = useStyles();

  const debounced = useMemo(
    () =>
      debounce(value => {
        onChange(value);
      }, 350),
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
        )
      }}
      onChange={onChangeDebounced}
      disabled={disabled}
    />
  );
};

export default SearchField;
