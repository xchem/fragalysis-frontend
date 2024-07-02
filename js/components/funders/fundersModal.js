/**
 * This is a modal window wrapper for funders.
 */

import React, { memo } from 'react';
import Modal from '../common/Modal';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { CONTRIBUTORS, FUNDING, get_logo } from './constants';
import { Tooltip } from '@mui/material';

const COLUMNS = 5;
const MAX_IMAGE_HEIGHT = 90;

const useStyles = makeStyles(theme => ({
  imageItem: {
    paddingTop: '3px',
    paddingBottom: '3px',
    cursor: 'pointer',
    // xs like styling to custom number of columns
    flexGrow: 0,
    maxWidth: (100 / COLUMNS) + '%',
    flexBasis: (100 / COLUMNS) + '%'
  },
  // https://material-ui.com/components/grid/
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: 200,
    maxHeight: MAX_IMAGE_HEIGHT
  },
  customModal: {
    width: '80%'
  },
  contributors: {
    marginTop: MAX_IMAGE_HEIGHT
  }
}));

export const FundersModal = memo(({ openModal, onModalClose }) => {
  const classes = useStyles();

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  const openLink = link => {
    // window.location.href = link;
    window.open(link, 'blank');
  };

  return (
    <Modal otherClasses={classes.customModal} open={openModal} onClose={() => onModalClose()}>
      <Typography variant="h5">Funding and support:</Typography>
      <Grid container direction="row" justifyContent="center" alignItems="center" columns={5}>
        {FUNDING.map((company, i) =>
          <Tooltip title={company.title} key={`funding-${i}`}>
            <Grid key={`funding-${i}`} item className={classes.imageItem} onClick={() => openLink(company.link)}>
              <img src={get_logo(company.image)} className={classes.img} alt={company.title} />
            </Grid>
          </Tooltip>
        )}
      </Grid>
      <Typography variant="h5" className={classes.contributors}>Contributors and collaborators:</Typography>
      <Grid container direction="row" justifyContent="center" alignItems="center" columns={5}>
        {CONTRIBUTORS.map((company, i) =>
          <Tooltip title={company.title} key={`contributor-${i}`}>
            <Grid item className={classes.imageItem} onClick={() => openLink(company.link)}>
              <img src={get_logo(company.image)} className={classes.img} alt={company.title} />
            </Grid>
          </Tooltip>
        )}
      </Grid>
    </Modal>
  );
});
