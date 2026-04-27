const mockTeachers = [
  { id: 1, firstName: 'John', lastName: 'Teacher', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 2, firstName: 'Jane', lastName: 'Coach', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

const mockSession = {
  id: 1,
  name: 'Morning Yoga',
  description: 'A relaxing morning session',
  date: '2024-06-01T00:00:00.000Z',
  teacher_id: 1,
  users: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('Session form', () => {
  describe('Create mode', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/session', []).as('sessions');
      cy.intercept('GET', '/api/teacher', mockTeachers).as('teachers');
      cy.login(true);
      cy.wait('@sessions');
      cy.contains('button', 'Create').click();
      cy.url().should('include', '/sessions/create');
      cy.wait('@teachers');
    });

    it('should display the create form with title', () => {
      cy.contains('Create session').should('be.visible');
      cy.get('input[formControlName=name]').should('exist');
      cy.get('input[formControlName=date]').should('exist');
      cy.get('textarea[formControlName=description]').should('exist');
    });

    it('should disable submit button when form is empty', () => {
      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should enable submit when all fields are filled', () => {
      cy.get('input[formControlName=name]').type('New Session');
      cy.get('input[formControlName=date]').type('2024-12-01');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('A great session');
      cy.get('button[type=submit]').should('not.be.disabled');
    });

    it('should create a session, show snackbar and navigate to sessions list', () => {
      cy.intercept('POST', '/api/session', mockSession).as('createSession');
      cy.intercept('GET', '/api/session', [mockSession]).as('sessionsAfter');

      cy.get('input[formControlName=name]').type('New Session');
      cy.get('input[formControlName=date]').type('2024-12-01');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('A great session');
      cy.get('button[type=submit]').click();

      cy.wait('@createSession');
      cy.contains('Session created !').should('be.visible');
      cy.url().should('include', '/sessions');
    });

    it('should navigate back to sessions when clicking back arrow', () => {
      cy.get('button[mat-icon-button]').first().click();
      cy.url().should('include', '/sessions');
    });
  });

  describe('Update mode', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/session', [mockSession]).as('sessions');
      cy.intercept('GET', '/api/session/1', mockSession).as('sessionDetail');
      cy.intercept('GET', '/api/teacher', mockTeachers).as('teachers');
      cy.login(true);
      cy.wait('@sessions');
      cy.get('mat-card.item').first().contains('button', 'Edit').click();
      cy.url().should('include', '/sessions/update');
      cy.wait('@sessionDetail');
      cy.wait('@teachers');
    });

    it('should display the update form with existing data', () => {
      cy.contains('Update session').should('be.visible');
      cy.get('input[formControlName=name]').should('have.value', 'Morning Yoga');
      cy.get('textarea[formControlName=description]').should('have.value', 'A relaxing morning session');
    });

    it('should update the session, show snackbar and navigate to sessions list', () => {
      cy.intercept('PUT', '/api/session/1', { ...mockSession, name: 'Updated Yoga' }).as('updateSession');
      cy.intercept('GET', '/api/session', [mockSession]).as('sessionsAfter');

      cy.get('input[formControlName=name]').clear().type('Updated Yoga');
      cy.get('button[type=submit]').click();

      cy.wait('@updateSession');
      cy.contains('Session updated !').should('be.visible');
      cy.url().should('include', '/sessions');
    });

    it('should navigate back to sessions when clicking back arrow', () => {
      cy.get('button[mat-icon-button]').first().click();
      cy.url().should('include', '/sessions');
    });
  });

  describe('Non-admin access', () => {
    it('should redirect unauthenticated user accessing create form to login', () => {
      cy.visit('/sessions/create');
      cy.url().should('include', '/login');
    });

    it('should redirect authenticated non-admin to sessions when navigating to create form', () => {
      cy.intercept('GET', '/api/session', []).as('sessions');
      cy.intercept('GET', '/api/teacher', mockTeachers).as('teachers');
      cy.login(false);
      cy.wait('@sessions');
      cy.window().then((win) => {
        win.history.pushState({}, '', '/sessions/create');
        win.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      });
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/create');
    });
  });
});
