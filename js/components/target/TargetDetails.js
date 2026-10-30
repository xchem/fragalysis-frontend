import React, { useMemo } from 'react';
import { Alert, Button, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { targetBlogImageUrl } from './targetBlogApi';
import { useTargetBlog } from './useTargetBlog';

export const TargetDetails = ({ target, preview, classes, onDownload, loadBlog, imageRefreshToken }) => {
  const isEditing = useSelector(
    state =>
      Boolean(state.targetReducers?.isEditTargetDialogOpen) && state.selectionReducers?.targetToEdit?.id === target.id
  );
  const blog = useTargetBlog(target.id, !isEditing, loadBlog);
  const imageUrl = useMemo(
    () => targetBlogImageUrl(blog.record?.image, imageRefreshToken),
    [blog.record, imageRefreshToken]
  );
  const settings = target.settings;
  const renderChart =
    settings?.measured_compounds &&
    settings?.crystallographic_binding_events &&
    settings?.bound_compounds &&
    settings?.associated_affinity_measurements;

  return (
    <div className={`${classes.dropdownContent} ${imageUrl ? '' : classes.dropdownWithoutImage}`}>
      {imageUrl && (
        <img className={classes.dropdownImage} src={imageUrl} alt={`Blog preview for ${target.display_name}`} />
      )}
      <div className={classes.dropdownBlog}>
        {blog.status === 'loading' && <Typography role="status">Loading blog…</Typography>}
        {blog.status === 'error' && (
          <Alert severity="error">
            {Object.values(blog.errors).join(' ')}
            <Button onClick={blog.retry}>Retry loading blog</Button>
          </Alert>
        )}
        {blog.status === 'ready' && !blog.record && <Typography>No blog has been added.</Typography>}
        {blog.status === 'ready' && blog.record && (
          <>
            {blog.record.published && (
              <Typography
                className={classes.dropdownDate}
                variant="body2"
                component="time"
                dateTime={blog.record.published}
              >
                {moment(blog.record.published, 'YYYY-MM-DD').format('MMMM D, YYYY')}
              </Typography>
            )}
            <Typography
              className={classes.dropdownTitle}
              variant="h5"
              component="a"
              href={blog.record.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {blog.record.title}
            </Typography>
          </>
        )}
        <div
          className={classes.dropdownOverview}
          role="region"
          aria-label={`Blog overview for ${target.display_name}`}
          tabIndex={0}
        >
          {blog.status === 'ready' && blog.record?.overview && (
            <Typography className={classes.dropdownText} variant="body2">
              {blog.record.overview}
            </Typography>
          )}
          <div className={classes.dropdownActions}>
            <Button component={Link} to={preview} className={classes.dropdownButton} variant="contained">
              Go to target
            </Button>
            <Button className={classes.dropdownButton} onClick={() => onDownload(target)} variant="contained">
              Download the full dataset
            </Button>
          </div>
        </div>
      </div>
      {renderChart && (
        <BarChart
          layout="horizontal"
          height={145}
          yAxis={[
            {
              scaleType: 'band',
              data: [''],
              width: 0,
              barGapRatio: 0.5
            }
          ]}
          xAxis={[{ label: 'Count' }]}
          series={[
            {
              id: 'binding-events',
              label: 'Binding events',
              data: [settings?.crystallographic_binding_events ?? 0],
              color: '#1976d2'
            },
            {
              id: 'bound-compounds',
              label: 'Bound compounds',
              data: [settings?.bound_compounds ?? 0],
              color: '#64b5f6'
            },
            {
              id: 'affinity-measurements',
              label: 'Affinity measurements',
              data: [settings?.associated_affinity_measurements ?? 0],
              color: '#7b1fa2'
            },
            {
              id: 'measured-compounds',
              label: 'Measured compounds',
              data: [settings?.measured_compounds ?? 0],
              color: '#ba68c8'
            }
          ]}
          margin={{ top: 5, right: 30, bottom: 0, left: 20 }}
          slotProps={{
            legend: {
              direction: 'horizontal',
              position: { vertical: 'bottom', horizontal: 'center' },
              sx: {
                width: 'calc(100% - 50px)',
                borderTop: '1px solid #9e9e9e',
                paddingTop: 1,
                marginTop: 0,
                marginBottom: 2,
                justifyContent: 'center'
              }
            }
          }}
          borderRadius={4}
        />
      )}
    </div>
  );
};
