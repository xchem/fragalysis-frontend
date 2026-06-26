import LoginPage from '../pageobjects/loginPage.js';
import General from '../pageobjects/general.js';

describe('Menu for not logged in user', () => {
  beforeEach(() => {
    const loginObj = new LoginPage();
    loginObj.visit();
  });

  it('Menu options', () => {
    const generalObj = new General();
    const loginObj = new LoginPage();

    generalObj.elements.openMenuButton().click();
    generalObj.menuManagement();
    generalObj.menuContributors();
    cy.get('body').type('{esc}');
    generalObj.menuHome();
    generalObj.performTargetSelection();
    generalObj.elements.openMenuButton().click();
    generalObj.menuLogin();

    loginObj.loginWithFedID(Cypress.env('login'), Cypress.env('password'));
    generalObj.elements.openMenuButton().click();
    generalObj.elements.LHSButton().should('be.visible');
    generalObj.elements.RHSButton().should('be.visible');
    generalObj.elements.metaDataUploadButton().should('be.visible');
    generalObj.elements.assayDataUploadButton().should('be.visible');
  });
});
