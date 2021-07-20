import React, { forwardRef, memo, useState } from 'react';
import {
  CircularProgress,
  Grid,
  Popper,
  IconButton,
  Typography,
  InputAdornment,
  TextField,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import { Panel } from '../../../common';
import { Close, Search } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';

const useStyles = makeStyles(theme => ({
  body: {
    width: '450px',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

export const TagEditor = memo(
  forwardRef(({ open = false, anchorEl, datasetID }, ref) => {
    const id = open ? 'simple-popover-mols-tag-editor' : undefined;
    const classes = useStyles();
    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState(null);

    let debouncedFn;

    const handleSearch = event => {
      /* signal to React not to nullify the event object */
      event.persist();
      if (!debouncedFn) {
        debouncedFn = debounce(() => {
          setSearchString(event.target.value !== '' ? event.target.value : null);
        }, 350);
      }
      debouncedFn();
    };

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
        <Panel
          hasHeader
          secondaryBackground
          title="Tag Editor"
          className={classes.paper}
          headerActions={[
            <TextField
              className={classes.search}
              id="search-inspiration-dialog"
              placeholder="Search"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="inherit" />
                  </InputAdornment>
                )
              }}
              onChange={handleSearch}
              disabled={false}
            />,
            <Tooltip title="Close inspirations">
              <IconButton
                color="inherit"
                className={classes.headerButton}
                // onClick={() => dispatch(setIsOpenInspirationDialog(false))}
              >
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        ></Panel>
      </Popper>
    );
  })
);
