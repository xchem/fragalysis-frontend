import React, { useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import RichTooltip from '../tooltip/RichTooltip';
import { TargetAccessDialog } from './AccessDialog';
import { canInspectAccess, getTargetAccessString } from './accessUtils';

export const TargetAccessAction = ({ target, compact = false }) => {
  const [open, setOpen] = useState(false);
  if (!canInspectAccess() || target?.isLegacy) return null;

  const tas = getTargetAccessString(target);
  const handleOpen = event => {
    event.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <RichTooltip absolutePath path={`fragalysis.components.accessDialog.${tas ? 'whoCanSeeMe' : 'missingTas'}`}>
        {compact ? (
          <IconButton
            size="small"
            aria-label={`Who can see this data: ${target?.display_name || target?.title || 'Target'}`}
            disabled={!tas}
            onClick={handleOpen}
            sx={{ p: 0 }}
          >
            <Visibility sx={{ height: 15 }} />
          </IconButton>
        ) : (
          <Button startIcon={<Visibility />} disabled={!tas} onClick={handleOpen}>
            Who can see this data
          </Button>
        )}
      </RichTooltip>
      <TargetAccessDialog open={open} target={target} onClose={() => setOpen(false)} />
    </>
  );
};
