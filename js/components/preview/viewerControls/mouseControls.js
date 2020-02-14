import React, { memo } from 'react';
import { Drawer } from '../../common/Navigation/Drawer';
import { makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  td: {
    borderColor: theme.palette.divider
  }
}));

export const MouseControls = memo(({ open, onClose }) => {
  const classes = useStyles();

  const rows = [
    { key: 'scroll', effect: 'zoom scene' },
    { key: 'scroll-ctrl', effect: 'move near clipping plane' },
    { key: 'scroll-shift', effect: 'move near clipping plane and far fog' },
    { key: 'scroll-alt', effect: 'change isolevel of isosurfaces' },
    { key: 'drag-right', effect: 'pan/translate scene' },
    { key: 'drag-middle', effect: 'zoom scene' },
    { key: 'drag left', effect: 'rotate scene' },
    { key: 'drag-shift-right', effect: 'zoom scene' },
    { key: 'drag-left+right', effect: 'zoom scene' },
    { key: 'drag-ctrl-right', effect: 'pan/translate hovered component' },
    { key: 'drag-ctrl-left', effect: 'rotate hovored component' },
    { key: 'clickPick-middle', effect: 'auto view picked component element' },
    { key: 'hoverPick', effect: 'show tooltip for hovered component element' },
    { key: 'i', effect: 'toggle stage spinning' },
    { key: 'k', effect: 'toggle stage rocking' },
    { key: 'p', effect: 'pause all stage animations' },
    { key: 'r', effect: 'reset stage auto view' }
  ];

  return (
    <Drawer title="Mouse controls" open={open} onClose={onClose}>
      <TableContainer>
        <Table size="small" aria-label="mouse controls table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.td}>Key</TableCell>
              <TableCell className={classes.td}>Effect</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow>
                <TableCell component="th" scope="row" className={classes.td}>
                  {row.key}
                </TableCell>
                <TableCell className={classes.td}>{row.effect}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Drawer>
  );
});
