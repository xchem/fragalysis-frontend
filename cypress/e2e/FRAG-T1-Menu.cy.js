import loginPage from '../pageobjects/loginPage.js'
import general from '../pageobjects/general.js'

describe('Menu for not logged in user', () => {
    beforeEach(()=>{
        const loginObj = new loginPage();
        loginObj.visit();// call visit method
    });

  it('Menu options', () => {
    const generalObj = new general();
    const loginObj = new loginPage();
    // Check menu options for not logged in user
    generalObj.elements.openMenuButton().click();
    generalObj.menuManagement();
    generalObj.menuContributors();
    cy.get('body').type('{esc}');
    generalObj.menuHome();
    generalObj.performTargetSelection();
    generalObj.elements.openMenuButton().click();
    generalObj.menuLogin();
    // Perform login to verify that menu options are correct for logged in user
    loginObj.loginWithFedID(Cypress.env('login'), Cypress.env('password'));
    generalObj.elements.openMenuButton().click();
    generalObj.elements.LHSButton().should('be.visible');
    generalObj.elements.RHSButton().should('be.visible');
    generalObj.elements.metaDataUploadButton().should('be.visible');
    generalObj.elements.assayDataUploadButton().should('be.visible');
    });

});