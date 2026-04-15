describe('Not found page', () => {
  it('should display Page not found ! page on unknown route', () => {
    cy.visit('/unknown-route');
    cy.url().should('include', '/404');
    cy.contains('Page not found !').should('be.visible');
  });

  it('should redirect /** to /404', () => {
    cy.visit('/some/deep/unknown/path');
    cy.url().should('include', '/404');
  });
});

describe('Logout', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/session', []).as('sessions');
    cy.login(true);
    cy.url().should('include', '/sessions');
  });

  it('should log out and redirect to home', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
    cy.contains('Logout').should('not.exist');
  });

  it('should redirect to login when accessing protected route after logout', () => {
    cy.contains('Logout').click();
    cy.visit('/sessions');
    cy.url().should('include', '/login');
  });
});
