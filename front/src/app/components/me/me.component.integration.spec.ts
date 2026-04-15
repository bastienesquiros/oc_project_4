/**
 * Integration tests for MeComponent
 * Tests the component with real UserService and a real SessionService,
 * using HttpClientTestingModule to intercept HTTP calls.
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { expect } from '@jest/globals';
import { MeComponent } from './me.component';
import { UserService } from '../../core/service/user.service';
import { SessionService } from '../../core/service/session.service';
import { User } from '../../core/models/user.interface';
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

const mockUser: User = {
  id: 1,
  email: 'test@test.com',
  lastName: 'User',
  firstName: 'Test',
  admin: false,
  password: 'password',
  createdAt: new Date('2024-01-01'),
};

describe('MeComponent (integration)', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let router: Router;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [UserService, SessionService],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn(mockSessionInfo);

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush the getById request triggered by ngOnInit
    const req = httpMock.expectOne('api/user/1');
    req.flush(mockUser);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create with real services', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data from real UserService on init', () => {
    expect(component.user).toEqual(mockUser);
  });

  it('should call DELETE on user account and logout', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.delete();

    const req = httpMock.expectOne('api/user/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(sessionService.isLogged).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should display non-admin badge correctly', () => {
    expect(component.user?.admin).toBe(false);
  });

  it('back should call window.history.back', () => {
    const historySpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(historySpy).toHaveBeenCalled();
  });
});
