import loginPage from '../pageobjects/loginPage.js'
import generalPage from '../pageobjects/general.js'
import hitNavigator from '../pageobjects/hitNavigator.js'

describe('Hit navigator - LPC buttons behaviour ', () => {
        beforeEach(() => {
                const loginObj = new loginPage();
                loginObj.visit();// call visit method
                loginObj.loginPositive(); // call login method
                loginObj.verifyLandingPage(); // call verifyLandingPage method
        })

        it('L, P, C buttons behaviour positive', () => {
                const generalObj = new generalPage();
                generalObj.performTargetSelection();// selec target
                const hitNavigatorObj = new hitNavigator();
                // L button
                cy.get('canvas').should('be.visible');
                cy.get('canvas').screenshot('before-click-L', { overwrite: true })
                hitNavigatorObj.clickLigandButton();
                cy.get('canvas').screenshot('after-click-L', { overwrite: true })

                const beforePath = "cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/before-click-L.png";
                const afterPath = "cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/after-click-L.png";
                generalObj.compareScreenshots(beforePath, afterPath);
                hitNavigatorObj.mediumcheckedButton(hitNavigatorObj.elements.allButton); // A button should be medium checked 
                hitNavigatorObj.uncheckedButton(hitNavigatorObj.elements.sidechainsButton); // P button should be unchecked
                hitNavigatorObj.uncheckedButton(hitNavigatorObj.elements.interactionsButton); // C button should be unchecked
                // P button
                hitNavigatorObj.clickSidechainsButton();
                cy.get('canvas').screenshot('after-click-P', { overwrite: true })
                const afterPathP = "cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/after-click-P.png";

                generalObj.compareScreenshots(beforePath, afterPathP);
                hitNavigatorObj.mediumcheckedButton(hitNavigatorObj.elements.allButton); // A button should be medium checked
                hitNavigatorObj.checkedButton(hitNavigatorObj.elements.ligandButton);// L button should be checked
                hitNavigatorObj.uncheckedButton(hitNavigatorObj.elements.interactionsButton); // C button should be unchecked 
                // C button
                hitNavigatorObj.clickInteractionsButton();
                cy.get('canvas').screenshot('after-click-C', { overwrite: true })
                const afterPathC = "cypress/screenshots/FRAG-T18-L,P,C-button.cy.js/after-click-C.png";

                generalObj.compareScreenshots(beforePath, afterPathC);
                hitNavigatorObj.checkedButton(hitNavigatorObj.elements.allButton); // A button should be medium checked
                hitNavigatorObj.checkedButton(hitNavigatorObj.elements.ligandButton);// L button should be unchecked
                hitNavigatorObj.checkedButton(hitNavigatorObj.elements.sidechainsButton); // P button should be unchecked 
        });
});




