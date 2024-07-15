/**
 * This is a modal window wrapper for funders.
 */

import React, { memo, useContext } from 'react';
import Modal from '../common/Modal';
import { Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import { CONTRIBUTORS, FUNDING, get_logo } from './constants';
import { Tooltip } from '@mui/material';
import { URLS } from '../routes/constants';
import { ContentCopyRounded } from '@mui/icons-material';
import { ToastContext } from '../toast';

const COLUMNS = 5;
const MAX_IMAGE_HEIGHT = 90;

const useStyles = makeStyles(theme => ({
  copyButton: {
    position: 'absolute',
    top: 0,
    right: 0
  },
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

  const { toastInfo } = useContext(ToastContext);

  if (openModal === undefined) {
    console.log('undefined openModal');
    onModalClose();
  }

  const openLink = link => {
    // window.location.href = link;
    window.open(link, 'blank');
  };

  const copyFundersLink = async () => {
    await navigator.clipboard.writeText(window.location.hostname + URLS.funders);
    toastInfo('Link was copied to the clipboard', { autoHideDuration: 5000 });
  };

  return (
    <Modal otherClasses={classes.customModal} open={openModal} onClose={() => onModalClose()}>
      <Tooltip title={'Click to copy link to this window'} >
        <IconButton color="inherit" onClick={copyFundersLink} className={classes.copyButton}>
          <ContentCopyRounded />
        </IconButton>
      </Tooltip>
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
