// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'



// TODO : https://github.com/m2ms/fragalysis-frontend/issues/2018
Cypress.on('uncaught:exception', (e) => {
  if (
    e.message && e.message.includes("'startSessionPolling'")
  ) {
    // Ignore this specific error and continue the test
    return false;
  }
  // Let other errors fail the test
  return true;
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});