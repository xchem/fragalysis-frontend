import LoginPage from '../pageobjects/loginPage.js';
import Snapshots from '../pageobjects/snapshots.js';

describe('Create Snapshot', () => {
  beforeEach(() => {
    const loginObj = new LoginPage();
    loginObj.visit();
    loginObj.loginPositive();
  });

  it('Create Snapshot', () => {
    const snapshotObj = new Snapshots();
    snapshotObj.createSnapshot();
  });
});
