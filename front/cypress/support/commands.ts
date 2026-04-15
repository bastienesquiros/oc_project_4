// Custom command: log in via API intercept + UI
Cypress.Commands.add('login', (admin = true) => {
  cy.intercept('POST', '/api/auth/login', {
    body: {
      id: 1,
      token: 'fake-token',
      type: 'Bearer',
      username: 'yoga@studio.com',
      firstName: 'Admin',
      lastName: 'User',
      admin,
    },
  });

  cy.visit('/login');
  cy.get('input[formControlName=email]').type('yoga@studio.com');
  cy.get('input[formControlName=password]').type('test!1234');
  cy.get('button[type=submit]').click();
  cy.url().should('include', '/sessions');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(admin?: boolean): Chainable<void>;
    }
  }
}
