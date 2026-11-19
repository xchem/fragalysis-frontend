import React from 'react';
import { IconButton } from '@mui/material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { makeStyles } from '../../../ui/styles';

const useStyles = makeStyles(theme => ({
  controls: { display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', flex: '0 0 auto' },
  button: {
    width: 19, height: 18, padding: 1, borderRadius: 0, color: theme.palette.primary.main,
    '& svg': { fontSize: 15 }
  }
}));

export const PoseTransferButtons = ({ previous, next, busy, onTransfer, toolbar = false }) => {
  const classes = useStyles();
  return (
    <div className={classes.controls}>
      <IconButton
        id={toolbar ? 'hit-navigator-transfer-first-pose-up' : undefined}
        className={classes.button}
        aria-label={toolbar ? 'Transfer first eligible pose settings upward' : 'Transfer settings to previous pose'}
        title="Transfer settings to previous pose"
        disabled={busy || !previous}
        onClick={() => previous && onTransfer(previous)}
      ><ArrowUpward /></IconButton>
      <IconButton
        id={toolbar ? 'hit-navigator-transfer-first-pose-down' : undefined}
        className={classes.button}
        aria-label={toolbar ? 'Transfer first eligible pose settings downward' : 'Transfer settings to next pose'}
        title="Transfer settings to next pose"
        disabled={busy || !next}
        onClick={() => next && onTransfer(next)}
      ><ArrowDownward /></IconButton>
    </div>
  );
};
