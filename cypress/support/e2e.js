import './commands';

// TODO: https://github.com/m2ms/fragalysis-frontend/issues/2018
Cypress.on('uncaught:exception', error => {
  if (error.message && error.message.includes("'startSessionPolling'")) {
    return false;
  }

  return true;
});

Cypress.on('uncaught:exception', () => {
  return false;
});
