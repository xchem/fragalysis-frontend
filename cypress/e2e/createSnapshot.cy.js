import loginPage from '../pageobjects/loginPage.js'
import snapshots from '../pageobjects/snapshots.js'

describe('Create Snapshot', () => {
  beforeEach(()=>{
    const loginObj = new loginPage();
    loginObj.visit();// call visit method
    loginObj.loginPositive(); // call login method
  });

    it('Create Snapshot', () => {
        const snapshotObj = new snapshots();
        snapshotObj.createSnapshot();
    });

});