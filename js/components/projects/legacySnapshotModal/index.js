import React, { useState } from 'react';
import { Button, Modal } from '../../common';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { updateClipboard } from '../../snapshot/helpers';

export const LegacySnapshotModal = ({ open, project, snapshot }) => {
  const [legacyLink, setLegacyLink] = useState('');

  if (DJANGO_CONTEXT['legacy_url'] && DJANGO_CONTEXT['legacy_url'] !== '' && legacyLink === '') {
    setLegacyLink(`${DJANGO_CONTEXT['legacy_url']}/viewer/react/projects/${project}/${snapshot}`);
  }

  const openInNewTab = () => {
    window.open(legacyLink);
  };

  return (
    <Modal open={open}>
      <>
        <DialogTitle id="form-dialog-title">Potential legacy link detected</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Project/Snapshot could not be resolved. It's possible that this is legacy URL and you may try to visit URL
            below.
          </DialogContentText>
          <a href={legacyLink} target="_blank">
            {legacyLink}
          </a>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => updateClipboard(legacyLink)} color="primary">
            Copy link
          </Button>
          <Button style={{ width: '175px' }} onClick={openInNewTab} color="primary">
            Open in new tab
          </Button>
        </DialogActions>
      </>
      {/* <h3>
        Project/Snapshot could not be resolved. It's possible that this is legacy URL and you may try to visit URL
        below. <br />
      </h3>
      <a href={legacyLink} target="_blank">
        Legacy URL
      </a> */}
    </Modal>
  );
};
