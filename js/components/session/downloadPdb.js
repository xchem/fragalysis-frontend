/**
 * Created by ricGillams on 7/12/2018.
 */
import React, { memo, useState } from 'react';
import JSZip from 'jszip';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import FileSaver from 'file-saver';
import { api } from '../utils/api';
import { CloudDownload, Loop } from '@material-ui/icons';

const DownloadPdb = memo(({ targetOn, targetOnName, key }) => {
  const [downloading, setDownloading] = useState(false);

  const handlePdbDownload = async () => {
    setDownloading(true);
    var protPdbUrl =
      window.location.protocol + '//' + window.location.host + '/api/protpdbbound/?target_id=' + targetOn.toString();
    var proteinsUrl =
      window.location.protocol + '//' + window.location.host + '/api/proteins/?target_id=' + targetOn.toString();
    const protResponse = await api({ url: proteinsUrl }).catch(error => {
      throw error;
    });
    const protJson = await protResponse.data;
    const protInfo = protJson.results;
    const pdbResponse = await api({ url: protPdbUrl }).catch(error => {
      throw error;
    });
    const pdbJson = await pdbResponse.data;
    const pdbInfo = pdbJson.results;
    var zip = new JSZip();
    const timeOptions = { year: 'numeric', month: 'short', day: '2-digit' };
    var fName =
      targetOnName + '_allPdb_' + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now()).replace(/\s/g, '-');
    var readmeRequired = false;
    var totFolder = zip.folder(fName);
    for (let structure in protInfo) {
      if (pdbInfo[structure].bound_pdb_data == null) {
        readmeRequired = true;
      } else {
        const pdbData = pdbInfo[structure].bound_pdb_data;
        const pdbCode = protInfo[structure].code;
        totFolder.file(pdbCode + '.pdb', pdbData);
      }
    }
    var readmeText =
      'Structures may be missing if they were not processed through the XChem pipeline. We are working to resolve this. Please contact support if this persists.';
    if (readmeRequired === true) {
      totFolder.file('README', readmeText);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(content, fName + '.zip');
    setDownloading(false);
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
      <Button key={key} color="primary" onClick={handlePdbDownload} startIcon={<CloudDownload />}>
        Download {targetOnName.toString()} structures
      </Button>
    );
  }
});

function mapStateToProps(state) {
  return {
    targetOn: state.apiReducers.present.target_on,
    targetOnName: state.apiReducers.present.target_on_name
  };
}

export default connect(mapStateToProps, null)(DownloadPdb);
