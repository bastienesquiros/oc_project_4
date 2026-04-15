/**
 * Integration tests for RegisterComponent
 * Tests the component with real AuthService,
 * using HttpClientTestingModule to intercept HTTP calls.
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/service/auth.service';

describe('RegisterComponent (integration)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule, BrowserAnimationsModule, HttpClientTestingModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create with real AuthService', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should register successfully: POST to API and navigate to /login', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({
      email: 'newuser@test.com',
      firstName: 'New',
      lastName: 'User',
      password: 'securePassword',
    });
    component.submit();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'newuser@test.com',
      firstName: 'New',
      lastName: 'User',
      password: 'securePassword',
    });
    req.flush(null);

    expect(component.onError).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should set onError to true when API returns an error', () => {
    component.form.setValue({
      email: 'existing@test.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });
    component.submit();

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ message: 'Email already exists' }, { status: 400, statusText: 'Bad Request' });

    expect(component.onError).toBe(true);
  });

  it('should not submit when required fields are missing', () => {
    component.form.setValue({ email: '', firstName: '', lastName: '', password: '' });
    expect(component.form.valid).toBe(false);
    httpMock.expectNone('/api/auth/register');
  });
});
