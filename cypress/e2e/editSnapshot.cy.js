import loginPage from '../pageobjects/loginPage.js'
import snapshots from '../pageobjects/snapshots.js'

describe('Edit Snapshot', () => {
  beforeEach(()=>{
    const loginObj = new loginPage();
    loginObj.visit();// call visit method
    loginObj.loginPositive(); // call login method
  });

  it('Edit Snapshot', () => {
        const snapshotObj = new snapshots();
        snapshotObj.renameSnapshot();
        snapshotObj.updateSnapshot();
    });
});