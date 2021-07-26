/**
 * Created by ricGillams on 7/12/2018.
 */
import React, { memo, useState } from 'react';
import JSZip from 'jszip';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import FileSaver from 'file-saver';
import { api } from '../../utils/api';
import { CloudDownload, Loop } from '@material-ui/icons';
// import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';

const DownloadPdb = memo(({ targetOn, targetOnName, key }) => {
  const [downloading, setDownloading] = useState(false);
  // const disableUserInteraction = useDisableUserInteraction();

  const handlePdbDownload = async () => {
    setDownloading(true);
    var dataUrl = window.location.protocol + '//' + window.location.host + '/api/targets/?title=' + targetOnName;
    /*var protPdbUrl =
      window.location.protocol + '//' + window.location.host + '/api/protpdbbound/?target_id=' + targetOn.toString();
    var proteinsUrl =
      window.location.protocol + '//' + window.location.host + '/api/proteins/?target_id=' + targetOn.toString();
    */
    var dataResponse = await api({ url: dataUrl }).catch(error => {
      throw error;
    });
    //console.log(dataResponse);
    const data = await dataResponse.data;
    //console.log(data);
    /*const protResponse = await api({ url: proteinsUrl }).catch(error => {
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
    const content = await zip.generateAsync({ type: 'blob' });*/
    //ileSaver.saveAs(content, fName + '.zip');
    var anchor = document.createElement('a');
    anchor.href = data.results[0].zip_archive;
    anchor.target = '_blank';
    //anchor.download = data.fileName;
    anchor.click();

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
      <Button
        key={key}
        color="primary"
        disabled={false}
        onClick={handlePdbDownload}
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
