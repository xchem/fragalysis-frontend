/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import Modal from './common/modal';
import { Button } from '@material-ui/core';

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
    checkBrowser();
  }, [checkBrowser]);

  return (
    <Modal open={notSupported}>
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
    </Modal>
  );
});

export { BrowserBomb };
