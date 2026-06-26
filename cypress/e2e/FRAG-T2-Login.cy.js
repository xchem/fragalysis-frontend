import LoginPage from '../pageobjects/loginPage.js';

describe('Login positive / negative', () => {
  beforeEach(() => {
    const loginObj = new LoginPage();
    loginObj.visit();
  });

  it('Login positive - valid username and password', () => {
    const loginObj = new LoginPage();
    loginObj.loginPositive();
    loginObj.verifyLandingPage();
  });

  it('Login negative - invalid username and password', () => {
    const loginObj = new LoginPage();
    loginObj.loginNegative();
  });
});
