import React, { Fragment, useState } from 'react';
import { Modal } from '../../common';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

export const LegacySnapshotModal = ({ open, project, snapshot }) => {
  const [legacyLink, setLegacyLink] = useState('');

  if (DJANGO_CONTEXT['legacy_url'] && DJANGO_CONTEXT['legacy_url'] !== '' && legacyLink === '') {
    setLegacyLink(`${DJANGO_CONTEXT['legacy_url']}/viewer/react/projects/${project}/${snapshot}`);
  }

  return (
    <Modal open={open}>
      <h3>
        Snapshot is not recognized. Maybe it is available in the legacy system. Please try link below. <br />
      </h3>
      <a href={legacyLink} target="_blank">
        Legacy link
      </a>
    </Modal>
  );
};
