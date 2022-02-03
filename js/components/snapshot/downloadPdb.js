/**
 * Created by ricGillams on 7/12/2018.
 */
import React, { memo, useState } from 'react';
import JSZip from 'jszip';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import FileSaver from 'file-saver';
import { api } from '../../utils/api';
import { CloudDownload, Loop } from '@material-ui/icons';
import { setDownloadStructuresDialogOpen } from './redux/actions';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { getTagMolecules } from '../preview/tags/api/tagsApi';
import { compareTagsAsc } from '../preview/tags/utils/tagUtils';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { diffBetweenDatesInDays } from '../../utils/common';
import { setDownloadTags } from '../../reducers/api/actions';

const DownloadPdb = memo(({ targetOn, targetOnName, key }) => {
  const dispatch = useDispatch();
  const [downloading, setDownloading] = useState(false);
  const target_on = useSelector(state => state.apiReducers.target_on);
  // const disableUserInteraction = useDisableUserInteraction();

  const handlePdbDownload = async () => {
    setDownloading(true);
    var dataUrl = window.location.protocol + '//' + window.location.host + '/api/targets/?title=' + targetOnName;
    var dataResponse = await api({ url: dataUrl }).catch(error => {
      throw error;
    });
    const data = await dataResponse.data;
    var anchor = document.createElement('a');
    if (data.results[0].title == 'Mpro') {
      anchor.href = 'https://zenodo.org/record/5226381/files/Mpro.zip?download=1';
    } else {
      anchor.href = data.results[0].zip_archive;
    }
    anchor.target = '_blank';
    anchor.click();

    setDownloading(false);
  };

  const openDownloadStructuresDialog = () => {
    getTagMolecules(target_on)
      .then(data => {
        const sorted = data.results.sort(compareTagsAsc);
        const downloadTags = [];
        sorted.forEach(molTag => {
          if (molTag.additional_info && molTag.additional_info.requestObject && molTag.additional_info.downloadName) {
            if (DJANGO_CONTEXT.pk) {
              if (molTag.user_id === DJANGO_CONTEXT.pk) {
                downloadTags.push(molTag);
              }
            } else {
              const diffInDays = diffBetweenDatesInDays(new Date(molTag.create_date), new Date());
              if (diffInDays <= 5) {
                downloadTags.push(molTag);
              }
            }
          }
        });
        return downloadTags;
      })
      .then(downloadTags => {
        dispatch(setDownloadTags(downloadTags));
        dispatch(setDownloadStructuresDialogOpen(true));
      });
  };

  if (targetOnName === undefined) {
    return (
      <Button key={key} color="primary" disabled startIcon={<Loop />}>
        Loading...
      </Button>
    );
  } else if (downloading === true) {
    return (
      <Button key={key} color="primary" disabled startIcon={<CloudDownload />}>
        Downloading...
      </Button>
    );
  } else {
    return (
      <Button
        key={key}
        color="primary"
        disabled={false}
        onClick={openDownloadStructuresDialog}
        startIcon={<CloudDownload />}
      >
        Download structures
      </Button>
    );
  }
});

function mapStateToProps(state) {
  return {
    targetOn: state.apiReducers.target_on,
    targetOnName: state.apiReducers.target_on_name
  };
}

export default connect(mapStateToProps, null)(DownloadPdb);
