class General {
  elements = {
    waiting: () => cy.wait(3000),
    selectTarget: () => cy.get('#public-targets-item-0'),
    dataDownloadProgressDialog: () => cy.get('#data-download-progress-dialog-title'),
    popupMessage: () => cy.get('#notistack-snackbar'),
    openMenuButton: () => cy.get('#open-menu-button'),
    homeButton: () => cy.get(':nth-child(3) > .MuiListItemText-root > .MuiTypography-root'),
    managementButton: () => cy.get(':nth-child(5) > .MuiListItemText-root > .MuiTypography-root'),
    contributorsButton: () => cy.get(':nth-child(6) > .MuiListItemText-root > .MuiTypography-root'),
    LHSButton: () => cy.get(':nth-child(10) > .MuiListItemText-root > .MuiTypography-root'),
    RHSButton: () => cy.get(':nth-child(11) > .MuiListItemText-root > .MuiTypography-root'),
    metaDataUploadButton: () => cy.get(':nth-child(12) > .MuiListItemText-root > .MuiTypography-root'),
    assayDataUploadButton: () => cy.get(':nth-child(13) > .MuiListItemText-root > .MuiTypography-root'),
    loginButton: () => cy.get('#login-button-id > .MuiListItemText-root > .MuiTypography-root')
  };

  performTargetSelection() {
    this.elements.selectTarget().click();
    this.elements.dataDownloadProgressDialog().should('not.be.visible');
    this.elements.waiting();
  }

  checkPopupMessage(expectedText) {
    this.elements.popupMessage().should('be.visible');
    this.elements.popupMessage().and('contain', expectedText);
  }

  menuNavigate(button, expectedText, expectedUrl = null) {
    button().should('have.text', expectedText);
    button().click();

    if (expectedUrl) {
      cy.url().should('contain', expectedUrl);
    }
  }

  menuHome() {
    this.menuNavigate(this.elements.homeButton, 'Home', '/landing');
  }

  menuManagement() {
    this.menuNavigate(this.elements.managementButton, 'Management', '/management');
  }

  menuContributors() {
    this.menuNavigate(this.elements.contributorsButton, 'Contributors');
  }

  menuLogin() {
    this.menuNavigate(this.elements.loginButton, 'Login', '/openid-connect/auth');
  }

  compareScreenshots(beforePath, afterPath) {
    cy.task('compareScreenshots', { beforePath, afterPath }).then(result => {
      expect(result.changedPixels, 'UI should change after click').to.be.greaterThan(0);
    });
  }
}

export default General;
