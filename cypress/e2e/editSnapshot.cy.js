import LoginPage from '../pageobjects/loginPage.js';
import Snapshots from '../pageobjects/snapshots.js';

describe('Edit Snapshot', () => {
  beforeEach(() => {
    const loginObj = new LoginPage();
    loginObj.visit();
    loginObj.loginPositive();
  });

  it('Edit Snapshot', () => {
    const snapshotObj = new Snapshots();
    snapshotObj.renameSnapshot();
    snapshotObj.updateSnapshot();
  });
});
