const landingRoute = '/viewer/react/landing/';
const managementRoute = '/viewer/react/management/';
const targetPreviewRoute = '/viewer/react/preview/target/';

const waitForLandingShell = () => {
  cy.get('#open-menu-button', { timeout: 60000 }).should('be.visible');
  cy.contains('Public targets', { timeout: 60000 }).should('be.visible');
  cy.contains('Private targets', { timeout: 60000 }).should('be.visible');
  cy.contains('Legacy targets', { timeout: 60000 }).should('be.visible');
};

const waitForPreviewShell = () => {
  cy.location('pathname', { timeout: 120000 }).should('include', targetPreviewRoute);
  cy.get('#open-menu-button', { timeout: 60000 }).should('be.visible');
  cy.get('#major_view', { timeout: 120000 }).should('be.visible');
  cy.get('#major_view canvas', { timeout: 120000 }).should('be.visible');
};

describe('Moorhen migration safety smoke tests', () => {
  beforeEach(() => {
    cy.viewport(1440, 900);
  });

  it('loads public landing and navigates to management without console errors', () => {
    cy.visitWithConsoleCheck(landingRoute);
    waitForLandingShell();
    cy.screenshot('smoke/landing');

    cy.get('#open-menu-button').click();
    cy.contains('.MuiListItemText-root', 'Management').should('be.visible').click();
    cy.location('pathname', { timeout: 30000 }).should('eq', managementRoute);
    cy.contains('Proposal List', { timeout: 30000 }).should('be.visible');
    cy.contains('Target List', { timeout: 30000 }).should('be.visible');
    cy.screenshot('smoke/management');

    cy.assertNoConsoleErrors();
  });

  it('opens the first public target preview and renders the NGL viewer shell', () => {
    cy.visitWithConsoleCheck(landingRoute);
    waitForLandingShell();

    cy.get('#public-targets-item-0', { timeout: 60000 }).should('be.visible').click();
    waitForPreviewShell();
    cy.screenshot('smoke/target-preview');

    cy.assertNoConsoleErrors();
  });
});
