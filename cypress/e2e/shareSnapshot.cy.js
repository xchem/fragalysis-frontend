import loginPage from '../pageobjects/loginPage.js'
import snapshots from '../pageobjects/snapshots.js'

describe('Share Snapshot', () => {
  beforeEach(()=>{
    const loginObj = new loginPage();
    loginObj.visit();// call visit method
    loginObj.loginPositive(); // call login method
  });

  it('Share Snapshot', () => {
        const snapshotObj = new snapshots();
        snapshotObj.shareSnapshot();
    });
});