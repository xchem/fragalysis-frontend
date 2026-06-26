class LoginPage {
  elements = {
    url: () => cy.visit('/'),
    submitButton: () => cy.get('[name="login"]'),
    loginButton: () => cy.get('#notistack-snackbar > span > .MuiTypography-root'),
    verifyLandingPage: () => cy.url().should('contain', Cypress.config().baseUrl),
    message: () => cy.get('.kc-feedback-text')
  };

  visit() {
    this.elements.url();
  }

  loginWithFedID(login, password, expectedErrorText = null) {
    cy.origin(
      'https://identity-test.diamond.ac.uk',
      { args: { login, password, expectedErrorText } },
      ({ login, password, expectedErrorText: errorText }) => {
        cy.get('body').then($body => {
          if ($body.find('#social-fedid-keycloak-oidc').length) {
            cy.get('#social-fedid-keycloak-oidc').click();
          }
        });

        cy.get('[name="username"]').type(login);
        cy.get('[name="password"]').type(password);
        cy.get('[name="login"]').click();

        if (errorText) {
          cy.get('.kc-feedback-text').should('contain.text', errorText);
        }
      }
    );
  }

  loginPositive() {
    this.elements.loginButton().click();
    this.loginWithFedID(Cypress.env('login'), Cypress.env('password'));
  }

  loginNegative() {
    this.elements.loginButton().click();
    this.loginWithFedID('invalid_user', 'invalid_password', 'Invalid username or password.');
  }

  verifyLandingPage() {
    this.elements.verifyLandingPage();
  }

  message(text) {
    this.elements.message().should('contain.text', text);
  }
}

export default LoginPage;
