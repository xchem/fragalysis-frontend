/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { Button } from '@material-ui/core';

const customStyles = {
  overlay: {
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.85)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-20%',
    transform: 'translate(-50%, -50%)',
    border: '10px solid #7a7a7a'
  }
};

const BrowserBomb = memo(props => {
  const [currentBrowser, setCurrentBrowser] = useState();
  const [notSupported, setNotSupported] = useState();

  const checkBrowser = useCallback(() => {
    if (typeof InstallTrigger !== 'undefined') {
      setCurrentBrowser('Firefox should be supported, please report error. We aim to support ');
      setNotSupported(false);
    } else if (!!window.chrome) {
      setCurrentBrowser('Chrome should be supported, please report error. We aim to support ');
      setNotSupported(false);
    } else {
      setCurrentBrowser('This browser is not supported by Fragalysis, please consider moving to');
      setNotSupported(true);
    }
  }, []);

  const closeModal = () => {
    setNotSupported(undefined);
  };

  useEffect(() => {
    ReactModal.setAppElement('body');
  }, []);

  useEffect(() => {
    checkBrowser();
  }, [checkBrowser]);

  return (
    <ReactModal isOpen={notSupported} style={customStyles}>
      <div>
        <h4>
          {currentBrowser}
          <a href="https://www.google.com/chrome/"> Google Chrome</a> or{' '}
          <a href="https://www.mozilla.org/en-GB/firefox/">Mozilla Firefox.</a>
        </h4>
        <Button size="small" variant="contained" color="primary" onClick={closeModal}>
          Close
        </Button>
      </div>
    </ReactModal>
  );
});

export { BrowserBomb };
