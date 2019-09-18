import React, { useState } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import BorderedView from "./borderedView";
import NGLView from "./nglComponents";
import MolGroupChecklist from "./molGroupChecklist";
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles(() => ({
  containerExpanded: {
    height: '208px',
    transition: 'height 0.2s'
  },
  containerCollapsed: {
    height: '0px',
    transition: 'height 0.2s'
  },
  nglViewItem: {
    paddingLeft: '4px'
  },
  checklistItem: {
    height: '100%'
  }
}));

export default () => {
  const [expanded, setExpanded] = useState(true);
  const classes = useStyles();

  const handleTitleButtonClick = () => {
    setExpanded(!expanded)
  }

  const titleButtonData = {
    content: expanded ? <ExpandLess /> : <ExpandMore />,
    onClick: handleTitleButtonClick
  }

  return (
    <BorderedView title="hit cluster selector" titleButtonData={titleButtonData}>
      <Grid item container alignItems="center" className={expanded ? classes.containerExpanded : classes.containerCollapsed}>
        <Grid item xs={5} className={classes.nglViewItem}>
          <NGLView div_id="summary_view" height={expanded ? "200px" : "0px"} />
        </Grid>
        <Grid item xs={7} className={classes.checklistItem}>
          {
            expanded && <MolGroupChecklist />
          }
        </Grid>
      </Grid>
    </BorderedView>
  )
}
