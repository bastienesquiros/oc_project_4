/**
 * Integration tests for LoginComponent
 * Tests the component with real AuthService and SessionService,
 * using HttpClientTestingModule to intercept HTTP calls.
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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

describe('LoginComponent (integration)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, BrowserAnimationsModule, HttpClientTestingModule],
      providers: [AuthService, SessionService],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create with real services', () => {
    expect(component).toBeTruthy();
  });

  it('should have form invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should login successfully: call API, update session and navigate to /sessions', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({ email: 'test@test.com', password: 'password123' });
    component.submit();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com', password: 'password123' });
    req.flush(mockSessionInfo);

    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation).toEqual(mockSessionInfo);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('should set onError to true when API returns an error', () => {
    component.form.setValue({ email: 'test@test.com', password: 'wrongpassword' });
    component.submit();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.onError).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    expect(component.form.valid).toBe(false);
    // Not calling submit; no HTTP request expected
    httpMock.expectNone('/api/auth/login');
  });
});
