import loginPage from '../pageobjects/loginPage.js'
import generalPage from '../pageobjects/general.js'
import hitNavigator from '../pageobjects/hitNavigator.js'

describe('Hit navigator - A button', () => {
  beforeEach(() => {
    const loginObj = new loginPage();
    loginObj.visit();// call visit method
    loginObj.loginPositive(); // call login method
    loginObj.verifyLandingPage(); // call verifyLandingPage method
  })

  it('A button funcionality when some molecule parts are selected', () => {
    const generalObj = new generalPage();
    generalObj.performTargetSelection();
    const hitNavigatorObj = new hitNavigator();
    cy.get('canvas').should('be.visible');

    cy.get('canvas').screenshot('before-click-A', { overwrite: true })
    hitNavigatorObj.clickAllButton();
    cy.get('canvas').screenshot('after-click-A', { overwrite: true })
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.allButton);
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.ligandButton);
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.sidechainsButton);
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.interactionsButton);


    const beforePath = "cypress/screenshots/FRAG-T17-A-button.cy.js/before-click-A.png";
    const afterPath = "cypress/screenshots/FRAG-T17-A-button.cy.js/after-click-A.png";

    cy.task("compareScreenshots", { beforePath, afterPath }).then((result) => {
      expect(result.changedPixels, "UI should change after click").to.be.greaterThan(0);

    });




  });

});