const ignoredConsoleErrorMessages = [
  'ResizeObserver loop completed with undelivered notifications',
  'ResizeObserver loop limit exceeded'
];

const stringifyConsoleArgument = arg => {
  if (arg && arg.stack) {
    return arg.stack;
  }

  if (arg && arg.message) {
    return arg.message;
  }

  return String(arg);
};

Cypress.Commands.add('visitWithConsoleCheck', (url, options = {}) => {
  const onBeforeLoad = options.onBeforeLoad;

  cy.visit(url, {
    ...options,
    onBeforeLoad(win) {
      cy.stub(win.console, 'error').as('consoleError');

      if (onBeforeLoad) {
        onBeforeLoad(win);
      }
    }
  });
});

Cypress.Commands.add('assertNoConsoleErrors', (additionalIgnoredMessages = []) => {
  const ignoredMessages = ignoredConsoleErrorMessages.concat(additionalIgnoredMessages);

  cy.get('@consoleError').then(consoleError => {
    const unexpectedMessages = consoleError
      .getCalls()
      .map(call => call.args.map(stringifyConsoleArgument).join(' '))
      .filter(message => !ignoredMessages.some(ignoredMessage => message.includes(ignoredMessage)));

    expect(unexpectedMessages, 'unexpected console.error messages').to.deep.equal([]);
  });
});
