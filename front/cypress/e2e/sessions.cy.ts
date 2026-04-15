const mockSessions = [
  {
    id: 1,
    name: 'Morning Yoga',
    description: 'A relaxing morning session',
    date: '2024-06-01T08:00:00.000Z',
    teacher_id: 1,
    users: [2, 3],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Evening Flow',
    description: 'An energising evening session',
    date: '2024-06-02T18:00:00.000Z',
    teacher_id: 2,
    users: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('Sessions list', () => {
  describe('As admin user', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/session', mockSessions).as('sessions');
      cy.login(true);
      cy.url().should('include', '/sessions');
    });

    it('should display the list of sessions', () => {
      cy.contains('Morning Yoga').should('be.visible');
      cy.contains('Evening Flow').should('be.visible');
    });

    it('should show Create button for admin', () => {
      cy.contains('button', 'Create').should('be.visible');
    });

    it('should navigate to create form when clicking Create', () => {
      cy.intercept('GET', '/api/teacher', []).as('teachers');
      cy.contains('button', 'Create').click();
      cy.url().should('include', '/sessions/create');
    });

    it('should navigate to detail when clicking Detail', () => {
      cy.intercept('GET', '/api/session/1', mockSessions[0]).as('detail');
      cy.intercept('GET', '/api/teacher/1', { id: 1, firstName: 'John', lastName: 'Teacher' }).as('teacher');
      cy.get('mat-card').first().contains('button', 'Detail').click();
      cy.url().should('include', '/sessions/detail/1');
    });
  });

  describe('As non-admin user', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/session', mockSessions).as('sessions');
      cy.login(false);
      cy.url().should('include', '/sessions');
    });

    it('should not show Create button for non-admin', () => {
      cy.contains('button', 'Create').should('not.exist');
    });

    it('should still show Detail button', () => {
      cy.get('mat-card').first().contains('button', 'Detail').should('be.visible');
    });
  });

  describe('Unauthenticated access', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/sessions');
      cy.url().should('include', '/login');
    });
  });
});
