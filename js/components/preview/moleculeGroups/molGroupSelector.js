import React, { memo, useContext, useRef } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import NGLView from '../../nglView/nglView';
import MolGroupChecklist from './molGroupChecklist';
import { useDispatch } from 'react-redux';
import { VIEWS } from '../../../constants/constants';
import { withLoadingMolGroupList } from './withLoadingMolGroupList';
import { NglContext } from '../../nglView/nglProvider';
import { clearMoleculeGroupSelection } from './redux/dispatchActions';

export const heightOfBody = '164px';

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    height: heightOfBody
  },
  containerCollapsed: {
    height: 0
  },
  nglViewItem: {
    paddingLeft: theme.spacing(1) / 2
  },
  checklistItem: {
    height: '100%'
  }
}));

const MolGroupSelector = memo(({ handleHeightChange }) => {
  const classes = useStyles();
  const ref = useRef(null);

  const { getNglView } = useContext(NglContext);
  const dispatch = useDispatch();

  return (
    <Panel
      ref={ref}
      hasHeader
      hasExpansion
      defaultExpanded
      title="Hit cluster selector"
      headerActions={[
        <Button
          onClick={() => dispatch(clearMoleculeGroupSelection({ getNglView }))}
          disabled={false}
          color="inherit"
          variant="text"
          size="small"
          startIcon={<Delete />}
          data-testid="clearSelectionButton"
        >
          Clear selection
        </Button>
      ]}
      onExpandChange={expand => {
        if (ref.current && handleHeightChange instanceof Function) {
          handleHeightChange(ref.current.offsetHeight);
        }
      }}
    >
      <Grid container justify="space-between" className={classes.containerExpanded}>
        <Grid item xs={5} className={classes.nglViewItem}>
          <NGLView div_id={VIEWS.SUMMARY_VIEW} height={heightOfBody} />
        </Grid>
        <Grid item xs={7} className={classes.checklistItem}>
          <MolGroupChecklist />
        </Grid>
      </Grid>
    </Panel>
  );
});

export default withLoadingMolGroupList(MolGroupSelector);
