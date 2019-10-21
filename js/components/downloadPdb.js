/**
 * Created by ricGillams on 7/12/2018.
 */
import React, { memo, useState } from 'react';
import JSZip from 'jszip';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import fetch from 'cross-fetch';
import FileSaver from 'file-saver';

const DownloadPdb = memo(({ targetOn, targetOnName }) => {
  const [downloading, setDownloading] = useState(false);

  const handlePdbDownload = async () => {
    setDownloading(true);
    var protPdbUrl =
      window.location.protocol + '//' + window.location.host + '/api/protpdbbound/?target_id=' + targetOn.toString();
    var proteinsUrl =
      window.location.protocol + '//' + window.location.host + '/api/proteins/?target_id=' + targetOn.toString();
    const protResponse = await fetch(proteinsUrl);
    const protJson = await protResponse.json();
    const protInfo = protJson.results;
    const pdbResponse = await fetch(protPdbUrl);
    const pdbJson = await pdbResponse.json();
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
      <Button bsSize="sm" bsStyle="warning" disabled>
        Loading...
      </Button>
    );
  } else if (downloading === true) {
    return (
      <Button bsSize="sm" bsStyle="warning" disabled>
        Downloading...
      </Button>
    );
  } else {
    return (
      <Button bsSize="sm" bsStyle="warning" onClick={handlePdbDownload}>
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

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DownloadPdb);
