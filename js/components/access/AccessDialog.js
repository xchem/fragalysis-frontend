import React, { useEffect, useId, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import RichTooltip from '../tooltip/RichTooltip';
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';
import { canInspectAccess, fetchAccessEntries, getTargetAccessString } from './accessUtils';

const AccessDialog = ({ target, tas, onClose }) => {
  const titleId = useId();
  const descriptionId = useId();
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ status: 'loading', entries: [] });
  const isTarget = tas !== undefined;

  useEffect(() => {
    let active = true;
    setResult({ status: 'loading', entries: [] });
    fetchAccessEntries(tas)
      .then(entries => {
        if (active) setResult({ status: 'ready', entries });
      })
      .catch(error => {
        if (!active) return;
        const status = error.response?.status;
        const message =
          status === 401 || status === 403
            ? 'Access lookup was denied. Please check that you are logged in and have permission to view this list.'
            : error.response || error.request
            ? 'Unable to load access information. Please try again.'
            : error.message || 'Unable to load access information. Please try again.';
        setResult({ status: 'error', entries: [], message });
      });
    // The API wrapper owns its Axios token. Ignore late replies after close, retry or a target change.
    return () => {
      active = false;
    };
  }, [tas, attempt]);

  const search = query.trim().toLowerCase();
  const visibleEntries = result.entries.filter(entry =>
    [entry.id, entry.name, entry.email].some(value => value.toLowerCase().includes(search))
  );

  return (
    <TooltipPathProvider absolute path="fragalysis.components.accessDialog">
      <Dialog
        open
        onClose={onClose}
        fullWidth
        maxWidth={isTarget ? 'md' : 'sm'}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <DialogTitle id={titleId}>{isTarget ? 'Who can see this data' : 'What can I see'}</DialogTitle>
        <DialogContent dividers>
          <Typography id={descriptionId} sx={{ mb: 2, overflowWrap: 'anywhere' }}>
            {isTarget
              ? `${target.display_name || target.title || 'Target'} — TAS: ${tas}`
              : 'Target access strings (TAS) available to your account.'}
          </Typography>
          {isTarget && target.project?.open_to_public && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This target is publicly accessible. The list below shows users associated with its TAS.
            </Alert>
          )}
          {result.status === 'loading' && (
            <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
              <CircularProgress size={20} aria-label="Loading access information" />
              <Typography>Loading access information…</Typography>
            </Box>
          )}
          {result.status === 'error' && (
            <Alert
              severity="error"
              action={
                <RichTooltip path="retry">
                  <Button color="inherit" onClick={() => setAttempt(value => value + 1)}>
                    Retry
                  </Button>
                </RichTooltip>
              }
            >
              {result.message}
            </Alert>
          )}
          {result.status === 'ready' && (
            <>
              <TextField
                fullWidth
                size="small"
                label={isTarget ? 'Search users' : 'Search TAS'}
                value={query}
                onChange={event => setQuery(event.target.value)}
                sx={{ mb: 1 }}
              />
              <Typography role="status" variant="body2" sx={{ mb: 1 }}>
                Showing {visibleEntries.length} of {result.entries.length} {isTarget ? 'users' : 'TAS'}
              </Typography>
              {visibleEntries.length > 0 ? (
                <TableContainer sx={{ maxHeight: '50vh' }}>
                  <Table stickyHeader size="small" aria-label={isTarget ? 'TAS users' : 'Accessible TAS'}>
                    <TableHead>
                      <TableRow>
                        <TableCell>{isTarget ? 'FedID' : 'TAS'}</TableCell>
                        {isTarget && <TableCell>Full name</TableCell>}
                        {isTarget && <TableCell>Email</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleEntries.map((entry, index) => (
                        <TableRow key={`${entry.id}-${index}`}>
                          <TableCell sx={{ overflowWrap: 'anywhere' }}>{entry.id}</TableCell>
                          {isTarget && <TableCell sx={{ overflowWrap: 'anywhere' }}>{entry.name}</TableCell>}
                          {isTarget && <TableCell sx={{ overflowWrap: 'anywhere' }}>{entry.email}</TableCell>}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ py: 2 }}>
                  {result.entries.length > 0
                    ? 'No matches found.'
                    : isTarget
                    ? 'No users are associated with this TAS.'
                    : 'No TAS are available to your account.'}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <RichTooltip path="close">
            <Button onClick={onClose}>Close</Button>
          </RichTooltip>
        </DialogActions>
      </Dialog>
    </TooltipPathProvider>
  );
};

// Mount only while open, so every opening fetches fresh data and resets search/errors.
export const UserAccessDialog = ({ open, onClose }) =>
  open && canInspectAccess() ? <AccessDialog onClose={onClose} /> : null;

export const TargetAccessDialog = ({ open, target, onClose }) => {
  const tas = getTargetAccessString(target);
  return open && canInspectAccess() && tas ? (
    <AccessDialog key={`${target.id}-${tas}`} target={target} tas={tas} onClose={onClose} />
  ) : null;
};
