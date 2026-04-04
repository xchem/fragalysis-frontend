import { makeStyles, Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import React, { memo, useCallback, useContext } from 'react';
import { ToastContext } from '../../../toast';
import RichTooltip from '../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  posePropertiesTableCell: {
    padding: '4px 8px'
  },
  posePropertiesTable: {
    pointerEvents: 'auto',
    '& tr > td:nth-of-type(2)': {
      border: 'none',
      borderLeft: '1px dashed ' + theme.palette.primary.main
    },
    '& tr:hover': {
      backgroundColor: theme.palette.primary.light
    }
  }
}));

export const CopyDataTable = memo(({ mainObservation, target_on_name, data, aliasOrder, handleTableIsOpen }) => {
  const classes = useStyles();
  const { toastInfo } = useContext(ToastContext);
  const observationCode = mainObservation?.code?.replaceAll(`${target_on_name}-`, '') || '';

  const copyToClipboard = useCallback(
    async (type, text) => {
      await navigator.clipboard.writeText(text);
      toastInfo(`${text} of '${type}' was copied to the clipboard`, { autoHideDuration: 5000 });
    },
    [toastInfo]
  );

  return (
    <Table
      className={classes.posePropertiesTable}
      onMouseLeave={() => handleTableIsOpen(false)}
      onMouseEnter={() => handleTableIsOpen(true)}
    >
      <TableBody>
        <RichTooltip path="copySmiles">
          <TableRow onClick={() => copyToClipboard('smiles', data.smiles)}>
            <TableCell className={classes.posePropertiesTableCell}>copy smiles</TableCell>
            <TableCell className={classes.posePropertiesTableCell}>{data.smiles}</TableCell>
          </TableRow>
        </RichTooltip>
        <RichTooltip path="copyObservationCode">
          <TableRow onClick={() => copyToClipboard('smiles', observationCode)}>
            <TableCell className={classes.posePropertiesTableCell}>copy observation code</TableCell>
            <TableCell className={classes.posePropertiesTableCell}>{observationCode}</TableCell>
          </TableRow>
        </RichTooltip>
        <RichTooltip path="copyPrefixTooltip">
          <TableRow onClick={() => copyToClipboard('prefix_tooltip', mainObservation?.prefix_tooltip)}>
            <TableCell className={classes.posePropertiesTableCell}>copy prefix_tooltip</TableCell>
            <TableCell className={classes.posePropertiesTableCell}>{mainObservation?.prefix_tooltip ?? ''}</TableCell>
          </TableRow>
        </RichTooltip>
        {aliasOrder?.map((alias, index) => {
          const compoundCode = mainObservation?.identifiers.find(identifier => identifier.type === alias)?.name ?? '';
          return (
            <RichTooltip key={index} path="copyAlias" values={{ alias }}>
              <TableRow
                onClick={() =>
                  copyToClipboard(alias, alias === 'compound_code' ? mainObservation?.compound_code : compoundCode)
                }
              >
                <TableCell className={classes.posePropertiesTableCell}>{`copy ${alias}`}</TableCell>
                {alias === 'compound_code' ? (
                  <TableCell
                    className={classes.posePropertiesTableCell}
                  >{`${mainObservation?.compound_code}`}</TableCell>
                ) : (
                  <TableCell className={classes.posePropertiesTableCell}>{`${compoundCode}`}</TableCell>
                )}
              </TableRow>
            </RichTooltip>
          );
        })}
      </TableBody>
    </Table>
  );
});
