import loginPage from '../pageobjects/loginPage.js'

describe('Login positive / negative', () => {
  beforeEach(()=>{
    const loginObj = new loginPage();
    loginObj.visit();// call visit method
    })
   
    it('Login positive - valid username and password', () => {
      const loginObj = new loginPage(); //define object
      loginObj.loginPositive(); // call login method
      loginObj.verifyLandingPage(); // call verifyLandingPage method 
     });

    it('Login negative - invalid username and password', () => {
      const loginObj = new loginPage(); //define object
      loginObj.loginNegative(); // call login method
    });

});