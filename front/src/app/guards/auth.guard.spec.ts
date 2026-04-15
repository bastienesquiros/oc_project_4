import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { AuthGuard } from './auth.guard';
import { SessionService } from '../core/service/session.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockRouter: { navigate: jest.Mock };
  let mockSessionService: { isLogged: boolean };

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() };
    mockSessionService = { isLogged: false };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService },
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('canActivate should return true when logged in', () => {
    mockSessionService.isLogged = true;
    expect(guard.canActivate()).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('canActivate should return false and navigate to login when not logged in', () => {
    mockSessionService.isLogged = false;
    expect(guard.canActivate()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['login']);
  });
});
