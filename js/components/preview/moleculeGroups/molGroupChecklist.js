import React, { memo, useContext } from 'react';
import { Grid, makeStyles, Checkbox, Tooltip, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { heightOfBody } from './molGroupSelector';
import { VIEWS } from '../../../constants/constants';
// import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
import { NglContext } from '../../nglView/nglProvider';
import { onSelectMoleculeGroup } from './redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  divContainer: {
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2
  },
  divScrollable: {
    height: '100%',
    width: '100%',
    border: 'solid 1px #DEDEDE',
    overflow: 'auto'
  },
  selectedLine: {
    color: theme.palette.primary.main,
    fontWeight: 'bold'
  },
  title: {
    position: 'relative',
    top: `calc(0px - 6px - ${heightOfBody})`,
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.white,
    width: 'fit-content',
    fontWeight: 'bold'
  },
  rowItem: {
    height: 22
  },
  siteLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginLeft: '-6px'
  }
}));

const molGroupChecklist = memo(({}) => {
  const classes = useStyles();
  // const disableUserInteraction = useDisableUserInteraction();
  const { getNglView } = useContext(NglContext);
  const stageSummaryView = getNglView(VIEWS.SUMMARY_VIEW) && getNglView(VIEWS.SUMMARY_VIEW).stage;
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const dispatch = useDispatch();
  const mol_group_list = useSelector(state => state.apiReducers.mol_group_list);
  const mol_group_selection = useSelector(state => state.selectionReducers.mol_group_selection);

  return (
    <>
      <div className={classes.divContainer}>
        <div className={classes.divScrollable}>
          <Grid container direction="column">
            {mol_group_list &&
              mol_group_list.map((moleculeGroup, idx) => {
                const checked = mol_group_selection.some(i => i === moleculeGroup.id);
                return (
                  <Grid
                    item
                    container
                    alignItems="center"
                    justify="flex-start"
                    key={`mol-checklist-item-${idx}`}
                    className={classes.rowItem}
                  >
                    <Grid item xs={2}>
                      <Checkbox
                        color="primary"
                        checked={checked}
                        onChange={event => dispatch(onSelectMoleculeGroup({ moleculeGroup, stageSummaryView, majorViewStage, selectGroup: event.target.checked }))}
                        disabled={false}
                      />
                    </Grid>
                    <Grid item xs={10} className={checked ? classes.selectedLine : null}>
                      <Tooltip title={moleculeGroup.description}>
                        <Typography className={classes.siteLabel}>
                          {`Site ${idx + 1} - ${moleculeGroup.description}`}
                        </Typography>
                      </Tooltip>
                    </Grid>
                  </Grid>
                );
              })}
          </Grid>
        </div>
      </div>
      <div className={classes.title}>Selected sites:</div>
    </>
  );
});

export default molGroupChecklist;
