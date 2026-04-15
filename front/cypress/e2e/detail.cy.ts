const mockSession = {
  id: 1,
  name: 'Morning Yoga',
  description: 'A relaxing morning session',
  date: '2024-06-01T08:00:00.000Z',
  teacher_id: 1,
  users: [2, 3],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockTeacher = {
  id: 1,
  firstName: 'John',
  lastName: 'Teacher',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Session detail', () => {
  describe('As admin user', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/session', [mockSession]).as('sessions');
      cy.intercept('GET', '/api/session/1', mockSession).as('sessionDetail');
      cy.intercept('GET', '/api/teacher/1', mockTeacher).as('teacher');
      cy.login(true);
      cy.contains('button', 'Detail').click();
      cy.url().should('include', '/sessions/detail');
    });

    it('should display session information', () => {
      cy.contains('Morning Yoga').should('be.visible');
      cy.contains('A relaxing morning session').should('be.visible');
      cy.contains('2 attendees').should('be.visible');
    });

    it('should show teacher name', () => {
      cy.contains('John TEACHER').should('be.visible');
    });

    it('should show Delete button for admin', () => {
      cy.contains('button', 'Delete').should('be.visible');
    });

    it('should delete session and redirect to sessions list', () => {
      cy.intercept('DELETE', '/api/session/1', {}).as('deleteSession');
      cy.intercept('GET', '/api/session', []).as('sessionsAfterDelete');

      cy.contains('button', 'Delete').click();

      cy.wait('@deleteSession');
      cy.url().should('include', '/sessions');
    });
  });

  describe('As non-admin user (not participating)', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/session', [mockSession]).as('sessions');
      cy.intercept('GET', '/api/session/1', mockSession).as('sessionDetail');
      cy.intercept('GET', '/api/teacher/1', mockTeacher).as('teacher');
      cy.login(false);
      cy.contains('button', 'Detail').click();
      cy.url().should('include', '/sessions/detail');
    });

    it('should not show Delete button for non-admin', () => {
      cy.contains('button', 'Delete').should('not.exist');
    });

    it('should show Participate button when not participating', () => {
      cy.contains('button', 'Participate').should('be.visible');
    });

    it('should participate and refresh session', () => {
      const sessionWithUser = { ...mockSession, users: [1, 2, 3] };
      cy.intercept('POST', '/api/session/1/participate/1', {}).as('participate');
      cy.intercept('GET', '/api/session/1', sessionWithUser).as('refreshed');

      cy.contains('button', 'Participate').click();

      cy.wait('@participate');
      cy.contains('3 attendees').should('be.visible');
    });
  });

  describe('As non-admin user (already participating)', () => {
    beforeEach(() => {
      const participatingSession = { ...mockSession, users: [1, 2, 3] };
      cy.intercept('GET', '/api/session', [participatingSession]).as('sessions');
      cy.intercept('GET', '/api/session/1', participatingSession).as('sessionDetail');
      cy.intercept('GET', '/api/teacher/1', mockTeacher).as('teacher');
      cy.login(false);
      cy.contains('button', 'Detail').click();
      cy.url().should('include', '/sessions/detail');
    });

    it('should show Do not participate button when already participating', () => {
      cy.contains('button', 'Do not participate').should('be.visible');
    });

    it('should unparticipate and refresh session', () => {
      const sessionWithoutUser = { ...mockSession, users: [2, 3] };
      cy.intercept('DELETE', '/api/session/1/participate/1', {}).as('unparticipate');
      cy.intercept('GET', '/api/session/1', sessionWithoutUser).as('refreshed');

      cy.contains('button', 'Do not participate').click();

      cy.wait('@unparticipate');
      cy.contains('2 attendees').should('be.visible');
    });
  });
});
