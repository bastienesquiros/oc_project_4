describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('input[formControlName=email]').should('exist');
    cy.get('input[formControlName=password]').should('exist');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should disable submit button when fields are empty', () => {
    cy.get('button[type=submit]').should('be.disabled');
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('button[type=submit]').should('be.disabled');
    cy.get('input[formControlName=email]').clear();
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should login successfully and redirect to /sessions', () => {
    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        token: 'fake-token',
        type: 'Bearer',
        username: 'yoga@studio.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true,
      },
    }).as('loginRequest');

    cy.intercept('GET', '/api/session', []).as('sessions');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/sessions');
  });

  it('should show error message on wrong credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('loginFail');

    cy.get('input[formControlName=email]').type('wrong@email.com');
    cy.get('input[formControlName=password]').type('wrongpassword');
    cy.get('button[type=submit]').click();

    cy.wait('@loginFail');
    cy.get('.error').should('be.visible');
  });

  it('should have a link to register page', () => {
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });
});
