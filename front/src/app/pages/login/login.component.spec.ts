import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';
import { SessionInformation } from '../../core/models/sessionInformation.interface';

const mockSessionInfo: SessionInformation = {
  token: 'fake-token',
  type: 'Bearer',
  id: 1,
  username: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  admin: false,
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: { login: jest.Mock };
  let router: Router;
  let sessionService: SessionService;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn().mockReturnValue(of(mockSessionInfo)),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, BrowserAnimationsModule, HttpClientModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        SessionService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('form should be valid with valid email and password', () => {
    component.form.setValue({ email: 'test@test.com', password: 'password123' });
    expect(component.form.valid).toBe(true);
  });

  it('submit should call authService.login, call sessionService.logIn and navigate to sessions on success', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const logInSpy = jest.spyOn(sessionService, 'logIn');

    component.form.setValue({ email: 'test@test.com', password: 'password123' });
    component.submit();

    expect(mockAuthService.login).toHaveBeenCalled();
    expect(logInSpy).toHaveBeenCalledWith(mockSessionInfo);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('submit should set onError to true on error', () => {
    mockAuthService.login.mockReturnValue(throwError(() => new Error('Login failed')));

    component.form.setValue({ email: 'test@test.com', password: 'wrongpassword' });
    component.submit();

    expect(component.onError).toBe(true);
  });

  it('hide should toggle password visibility', () => {
    expect(component.hide).toBe(true);
    component.hide = false;
    expect(component.hide).toBe(false);
  });
});
