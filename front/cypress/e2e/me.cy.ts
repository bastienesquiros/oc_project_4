const mockUser = {
  id: 1,
  email: 'yoga@studio.com',
  firstName: 'Admin',
  lastName: 'User',
  admin: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Account (me)', () => {
  describe('Non-admin user', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/session', []).as('sessions');
      cy.intercept('GET', '/api/user/1', mockUser).as('user');
      cy.login(false);
      cy.contains('Account').click();
      cy.url().should('include', '/me');
    });

    it('should display user information', () => {
      cy.contains('Admin USER').should('be.visible');
      cy.contains('yoga@studio.com').should('be.visible');
    });

    it('should not show admin badge for non-admin user', () => {
      cy.contains('You are admin').should('not.exist');
    });

    it('should show delete account button', () => {
      cy.contains('button', 'Detail').should('be.visible');
    });

    it('should delete account and redirect to home', () => {
      cy.intercept('DELETE', '/api/user/1', {}).as('deleteUser');

      cy.contains('button', 'Detail').click();

      cy.wait('@deleteUser');
      cy.url().should('include', '/');
    });

    it('should navigate back when clicking back button', () => {
      cy.get('button[mat-icon-button]').first().click();
      cy.url().should('include', '/sessions');
    });
  });

  describe('Admin user', () => {
    beforeEach(() => {
      const adminUser = { ...mockUser, admin: true };
      cy.intercept('GET', '/api/session', []).as('sessions');
      cy.intercept('GET', '/api/user/1', adminUser).as('user');
      cy.login(true);
      cy.contains('Account').click();
      cy.url().should('include', '/me');
    });

    it('should show admin badge for admin user', () => {
      cy.contains('You are admin').should('be.visible');
    });

    it('should not show delete button for admin', () => {
      cy.contains('button', 'Detail').should('not.exist');
    });
  });
});
