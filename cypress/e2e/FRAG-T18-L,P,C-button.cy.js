import LoginPage from '../pageobjects/loginPage.js';
import General from '../pageobjects/general.js';
import HitNavigator from '../pageobjects/hitNavigator.js';

describe('Hit navigator - LPC buttons behaviour', () => {
  beforeEach(() => {
    const loginObj = new LoginPage();
    loginObj.visit();
    loginObj.loginPositive();
    loginObj.verifyLandingPage();
  });

  it('L, P, C buttons behaviour positive', () => {
    const generalObj = new General();
    generalObj.performTargetSelection();
    const hitNavigatorObj = new HitNavigator();

    cy.get('canvas').should('be.visible');
    cy.get('canvas').screenshot('before-click-L', { overwrite: true });
    hitNavigatorObj.clickLigandButton();
    cy.get('canvas').screenshot('after-click-L', { overwrite: true });

    const beforePath = 'cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/before-click-L.png';
    const afterPath = 'cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/after-click-L.png';
    generalObj.compareScreenshots(beforePath, afterPath);
    hitNavigatorObj.mediumcheckedButton(hitNavigatorObj.elements.allButton);
    hitNavigatorObj.uncheckedButton(hitNavigatorObj.elements.sidechainsButton);
    hitNavigatorObj.uncheckedButton(hitNavigatorObj.elements.interactionsButton);

    hitNavigatorObj.clickSidechainsButton();
    cy.get('canvas').screenshot('after-click-P', { overwrite: true });
    const afterPathP = 'cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/after-click-P.png';
    generalObj.compareScreenshots(beforePath, afterPathP);
    hitNavigatorObj.mediumcheckedButton(hitNavigatorObj.elements.allButton);
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.ligandButton);
    hitNavigatorObj.uncheckedButton(hitNavigatorObj.elements.interactionsButton);

    hitNavigatorObj.clickInteractionsButton();
    cy.get('canvas').screenshot('after-click-C', { overwrite: true });
    const afterPathC = 'cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/after-click-C.png';
    generalObj.compareScreenshots(beforePath, afterPathC);
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.allButton);
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.ligandButton);
    hitNavigatorObj.checkedButton(hitNavigatorObj.elements.sidechainsButton);
  });
});
