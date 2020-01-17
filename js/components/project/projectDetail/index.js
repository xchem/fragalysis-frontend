import React, { memo } from 'react';
import { Panel } from '../../common/Surfaces/Panel';
import { TreeItem, TreeView } from '@material-ui/lab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { IconButton, InputAdornment, makeStyles, TextField, Typography, Grid } from '@material-ui/core';
import { Search, Delete, Share, CheckCircle } from '@material-ui/icons';
import moment from 'moment';
import { CustomTreeItem } from './customTreeItem';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  table: {
    minWidth: 650
  },
  search: {
    margin: theme.spacing(1)
  }
}));

export const ProjectDetail = memo(() => {
  const classes = useStyles();

  return (
    <Panel
      hasHeader
      title="Snaphots"
      headerActions={[
        <TextField
          className={classes.search}
          id="input-with-icon-textfield"
          placeholder="Search"
          size="small"
          color="primary"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      ]}
    >
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={['0', '1', '2']}
      >
        <CustomTreeItem title="Init snapshot" nodeId="0" description="All molecules are in base form">
          <CustomTreeItem title="Major snapshot" nodeId="1" description="All major interactions are implemented">
            <CustomTreeItem
              title="Cancer branch snapshot"
              nodeId="2"
              description="Base model and 3 options are available"
            >
              <CustomTreeItem title="Cancer molecule" nodeId="3" description="This molecule is rare and expensive" />
              <CustomTreeItem
                title="Medical experiment"
                nodeId="4"
                description="Testing molecules for fighting with cancer"
              />
              <CustomTreeItem
                title="Biological experiment"
                nodeId="5"
                description="Testing molecules on animals, that are disabled by with cancer"
              />
            </CustomTreeItem>
          </CustomTreeItem>
        </CustomTreeItem>
      </TreeView>
    </Panel>
  );
});
