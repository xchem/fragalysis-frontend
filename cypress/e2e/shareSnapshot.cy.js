import LoginPage from '../pageobjects/loginPage.js';
import Snapshots from '../pageobjects/snapshots.js';

describe('Share Snapshot', () => {
  beforeEach(() => {
    const loginObj = new LoginPage();
    loginObj.visit();
    loginObj.loginPositive();
  });

  it('Share Snapshot', () => {
    const snapshotObj = new Snapshots();
    snapshotObj.shareSnapshot();
  });
});
