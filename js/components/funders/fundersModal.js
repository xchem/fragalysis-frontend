/**
 * This is a modal window wrapper for funders.
 */

import React, { memo, useContext } from 'react';
import Modal from '../common/Modal';
import { Button, GridLegacy as Grid, IconButton, Typography } from '@mui/material';
import { makeStyles } from '../../ui/styles';
import { CONTRIBUTORS, FUNDING, get_logo } from './constants';
import { Tooltip } from '@mui/material';
import { URLS } from '../routes/constants';
import { ContentCopyRounded } from '@mui/icons-material';
import { ToastContext } from '../toast';
import RichTooltip from '../tooltip/RichTooltip';

const COLUMNS = 5;
const MAX_IMAGE_HEIGHT = 81;

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
    maxWidth: 100 / COLUMNS + '%',
    flexBasis: 100 / COLUMNS + '%'
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
      <RichTooltip path="copy">
        <Button
          color="inherit"
          endIcon={<ContentCopyRounded />}
          onClick={copyFundersLink}
          className={classes.copyButton}
          // style={{ whiteSpace: 'nowrap' }}
        >
          Copy URL
        </Button>
      </RichTooltip>
      <Typography variant="h5">Funding and support:</Typography>
      <Grid container direction="row" justifyContent="center" alignItems="center" columns={5}>
        {FUNDING.map((company, i) => (
          <RichTooltip path="companyFunding" key={`funding-${i}`} values={{ companyTitle: company.title }}>
            <Grid key={`funding-${i}`} item className={classes.imageItem} onClick={() => openLink(company.link)}>
              <img src={get_logo(company.image)} className={classes.img} alt={company.title} />
            </Grid>
          </RichTooltip>
        ))}
      </Grid>
      <Typography variant="h5" className={classes.contributors}>
        Contributors and collaborators:
      </Typography>
      <Grid container direction="row" justifyContent="center" alignItems="center" columns={5}>
        {CONTRIBUTORS.map((company, i) => (
          <RichTooltip path="companyContributor" key={`contributor-${i}`} values={{ companyTitle: company.title }}>
            <Grid item className={classes.imageItem} onClick={() => openLink(company.link)}>
              <img src={get_logo(company.image)} className={classes.img} alt={company.title} />
            </Grid>
          </RichTooltip>
        ))}
      </Grid>
    </Modal>
  );
});
