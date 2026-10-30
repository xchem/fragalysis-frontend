import React, { useMemo } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  FormControlLabel,
  GridLegacy as Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import { targetBlogImageUrl } from './targetBlogApi';

const fields = [
  { name: 'url', label: 'Blog URL', placeholder: 'enter blog URL', required: true, type: 'url' },
  { name: 'title', label: 'Blog title', required: true },
  { name: 'published', label: 'Publication date', type: 'date' },
  { name: 'overview', label: 'Overview', multiline: true, minRows: 3 }
];

export const TargetBlogSettings = ({ blog, editable, disabled }) => {
  const imageUrl = useMemo(() => targetBlogImageUrl(blog.record?.image, Date.now()), [blog.record]);
  const knownErrors = [...fields.map(field => field.name), 'image', 'image_url'];
  const generalErrors = Object.entries(blog.errors).filter(([field]) => !knownErrors.includes(field));
  return (
    <Grid item container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="body1">Blog</Typography>
      </Grid>
      {blog.status === 'loading' && (
        <Grid item role="status">
          <CircularProgress size={16} /> Loading blog…
        </Grid>
      )}
      {generalErrors.map(([field, message]) => (
        <Grid item key={field}>
          <Alert severity="error">{message}</Alert>
        </Grid>
      ))}
      {blog.status === 'error' && (
        <Grid item>
          <Button onClick={blog.retry}>Retry loading blog</Button>
        </Grid>
      )}
      {blog.status === 'ready' && (
        <>
          {!editable && !blog.record && (
            <Grid item>
              <Typography>No blog has been added.</Typography>
            </Grid>
          )}
          {(editable || blog.record) &&
            fields.map(({ name, label, ...props }) => (
              <Grid item key={name}>
                {editable ? (
                  <TextField
                    {...props}
                    fullWidth
                    label={label}
                    value={blog.draft[name]}
                    onChange={event => blog.change(name, event.target.value)}
                    disabled={disabled}
                    error={Boolean(blog.errors[name])}
                    helperText={blog.errors[name]}
                    slotProps={props.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
                  />
                ) : (
                  <>
                    <Typography variant="body2">{label}</Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                      {blog.draft[name] || '—'}
                    </Typography>
                  </>
                )}
              </Grid>
            ))}
          {blog.record?.image && (
            <Grid item>
              <img
                src={imageUrl}
                alt="Current blog preview"
                style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }}
              />
            </Grid>
          )}
          {editable && (
            <Grid item>
              <RadioGroup
                row
                aria-label="Blog image source"
                value={blog.draft.imageMode}
                onChange={event => blog.change('imageMode', event.target.value)}
              >
                <FormControlLabel value="upload" control={<Radio />} label="Upload image" disabled={disabled} />
                <FormControlLabel value="url" control={<Radio />} label="Image URL" disabled={disabled} />
              </RadioGroup>
              {blog.draft.imageMode === 'upload' ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    aria-label="Upload blog image"
                    value=""
                    disabled={disabled}
                    onChange={event => blog.change('file', event.target.files?.[0] || null)}
                  />
                  {blog.draft.file && <Typography>{blog.draft.file.name}</Typography>}
                  {blog.errors.image && (
                    <Typography color="error" role="alert">
                      {blog.errors.image}
                    </Typography>
                  )}
                </>
              ) : (
                <TextField
                  fullWidth
                  label="Image URL"
                  type="url"
                  value={blog.draft.imageUrl}
                  onChange={event => blog.change('imageUrl', event.target.value)}
                  disabled={disabled}
                  error={Boolean(blog.errors.image_url)}
                  helperText={blog.errors.image_url || 'The image will be downloaded when you save.'}
                />
              )}
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};
