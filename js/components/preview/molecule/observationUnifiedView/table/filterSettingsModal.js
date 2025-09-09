/**
 * This is a modal window for target settings
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Grid, IconButton, makeStyles, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from '@material-ui/core';
import { Tooltip } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { api, METHOD } from '../../../../../utils/api';
import { base_url } from '../../../../routes/constants';
import { addToastMessage } from '../../../../../reducers/selection/actions';
import { TOAST_LEVELS } from '../../../../toast/constants';
import { getCurrentTarget } from '../../../../../reducers/api/selectors';
import { setLHSExtraColumns } from '../../../../../reducers/api/actions';

const useStyles = makeStyles(theme => ({
  copyButton: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  headerButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    color: theme.palette.grey[500]
  },
  root: {
    // minWidth: 300
  },
  identifier: {
    '&:hover': {
      cursor: 'grab'
    },
    backgroundColor: theme.palette.grey[300],
    borderRadius: 5,
    marginTop: 2,
    marginBottom: 2,
    paddingLeft: '8px !important',
    paddingRight: '8px !important'
  }
}));

export const FilterSettingsModal = memo(({ openModal, onModalClose }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const draggedIdentifier = useRef(0);
  const draggedOverIdentifier = useRef(0);

  const extraLHSColumns = useSelector(state => state.apiReducers.lhs_extra_columns);
  const currentTarget = useSelector(state => getCurrentTarget(state));

  const [extraColumns, setExtraColumns] = useState([]);
  const [editable, setEditable] = useState(false);

  const initData = useCallback(async () => {
    setExtraColumns(extraLHSColumns);
  }, [extraLHSColumns]);

  useEffect(() => {
    if (openModal) {
      initData();
    }
  }, [openModal, initData]);

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  const handleSort = () => {
    const originalColumns = [...extraColumns];

    const temp = originalColumns[draggedIdentifier.current];
    // originalColumns[draggedIdentifier.current] = originalColumns[draggedOverIdentifier.current];
    // originalColumns[draggedOverIdentifier.current] = temp;

    if (draggedIdentifier.current !== -1 && draggedOverIdentifier.current !== -1) {
      originalColumns.splice(draggedIdentifier.current, 1);
      originalColumns.splice(draggedOverIdentifier.current, 0, temp);
    }

    originalColumns.map((column, index) => {
      column.order = index + 1;
      return column;
    });

    setExtraColumns(originalColumns);
  };

  const handleVisibilityChange = (column, isVisible) => {
    const updatedColumns = extraColumns.map(col => {
      if (col.id === column.id) {
        return { ...col, visible: isVisible };
      }
      return col;
    });
    setExtraColumns(updatedColumns);
  };

  const onSubmitForm = async () => {
    if (extraColumns) {
      Promise.all(extraColumns.map(column =>
        api({
          url: `${base_url}/api/assay_data_property/${column.id}/`,
          method: METHOD.PATCH,
          data: {
            visible: column.visible,
            order: column.order
          }
        })
      ))
        .then(resp => {
          dispatch(setLHSExtraColumns(extraColumns));
          dispatch(addToastMessage({ text: `Columns updated successfully`, level: TOAST_LEVELS.SUCCESS }));
          onModalClose();
        })
        .catch(err => {
          dispatch(addToastMessage({ text: 'Error while updating columns', level: TOAST_LEVELS.ERROR }));
        })
        .finally(() => {
          setEditable(false);
        });
    }
  };

  return (
    <Dialog open={openModal} onClose={onModalClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>{editable ? "Edit LHS settings" : "LHS settings"}</DialogTitle>
      <Tooltip title="Close editor">
        <IconButton
          color="inherit"
          className={classes.headerButton}
          onClick={onModalClose}
        >
          <Close />
        </IconButton>
      </Tooltip>
      <DialogContent dividers>
        <Grid container justifyContent="flex-start" direction="column" className={classes.root} spacing={2}>
          <Grid item container direction="column" justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item xs>
              <Typography variant="body1">Order and visibility of extra columns</Typography>
            </Grid>
            {/* <Grid item xs>
              <Typography variant="body1">Order of columns</Typography>
            </Grid> */}
            <Grid item xs>
              {editable ?
                <Tooltip title="Drag and drop to reorder">
                  <Grid item container direction="column" justifyContent="center" alignItems="flex-start" spacing={1} onDrop={e => e.preventDefault()} onDragOver={e => e.preventDefault()}>
                    {extraColumns?.map((column, index) =>
                      <Grid key={column.id} item className={classes.identifier}
                        draggable="true"
                        onDragStart={() => draggedIdentifier.current = index}
                        onDragEnter={() => draggedOverIdentifier.current = index}
                        onDragEnd={handleSort}
                        onDragOver={e => e.preventDefault()}
                      >
                        <FormControlLabel control={<Checkbox checked={column.visible} onChange={e => handleVisibilityChange(column, e.target.checked)} />} label={`${index + 1}. ${column.result_property}`} />
                        {/* <Typography variant="body1">{`${index + 1}. ${column.result_property}`}</Typography> */}
                      </Grid>
                    )}
                  </Grid>
                </Tooltip> :
                <Grid item container direction="column" justifyContent="center" alignItems="flex-start" spacing={1}>
                  {extraColumns?.map((column, index) =>
                    <Grid key={column.id} item>
                      <FormControlLabel control={<Checkbox checked={column.visible} disabled={true} />} label={`${index + 1}. ${column.result_property}`} />
                      {/* <Typography variant="body1">{`${index + 1}. ${column.result_property}`}</Typography> */}
                    </Grid>
                  )}
                </Grid>
              }
              {extraColumns.length === 0 &&
                <Typography variant="body1">no extra columns defined (no assay data uploaded)</Typography>
              }
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => setEditable(!editable)}>
          {editable ? 'Cancel' : 'Edit'}
        </Button>
        <Button autoFocus onClick={onSubmitForm} disabled={!editable}>
          {'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
