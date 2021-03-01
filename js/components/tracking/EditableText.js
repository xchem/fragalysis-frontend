import React, { useState, useRef, useEffect } from 'react';
import { makeStyles, TextField, IconButton, Tooltip, Grid } from '@material-ui/core';
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  search: {
    width: '100%'
  },
  fontSizeSmall: {
    fontSize: '0.82rem'
  }
}));

const EditableInput = ({ dataText, index, updateText }) => {
  const inputRef = useRef(null);
  const [inputVisible, setInputVisible] = useState(false);
  const [text, setText] = useState(dataText);
  const classes = useStyles();

  const onClickOutSide = e => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setInputVisible(false);
      if (updateText && text !== dataText) {
        updateText(text);
      }
    }
  };

  useEffect(() => {
    // Handle outside clicks on mounted state
    if (inputVisible) {
      document.addEventListener('mousedown', onClickOutSide);
    }

    // This is a necessary step to "dismount" unnecessary events when we destroy the component
    return () => {
      document.removeEventListener('mousedown', onClickOutSide);
    };
  });

  return (
    <React.Fragment>
      {inputVisible ? (
        <TextField
          className={classes.search}
          ref={inputRef}
          value={text}
          onChange={e => {
            setText(e.target.value);
          }}
        />
      ) : (
        <Grid item key={index}>
          {<span onClick={() => setInputVisible(true)}>{text}</span>}
          {
            <IconButton color={'primary'} size="small" onClick={() => setInputVisible(true)}>
              <Tooltip title="Edit">
                <Edit className={classes.fontSizeSmall} />
              </Tooltip>
            </IconButton>
          }
        </Grid>
      )}
    </React.Fragment>
  );
};

export default EditableInput;
