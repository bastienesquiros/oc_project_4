import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { MeComponent } from './me.component';
import { UserService } from '../../core/service/user.service';
import { SessionService } from '../../core/service/session.service';
import { User } from '../../core/models/user.interface';

const mockUser: User = {
  id: 1,
  email: 'test@test.com',
  lastName: 'User',
  firstName: 'Test',
  admin: false,
  password: 'password',
  createdAt: new Date(),
};

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let mockUserService: { getById: jest.Mock; delete: jest.Mock };
  let mockSessionService: { sessionInformation: object; logOut: jest.Mock };
  let mockSnackBar: { open: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    mockUserService = {
      getById: jest.fn().mockReturnValue(of(mockUser)),
      delete: jest.fn().mockReturnValue(of(void 0)),
    };
    mockSessionService = {
      sessionInformation: {
        admin: true,
        id: 1,
        token: 'fake-token',
        type: 'Bearer',
        username: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
      },
      logOut: jest.fn(),
    };
    mockSnackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [MeComponent, RouterTestingModule, HttpClientModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load user data by id', () => {
    expect(mockUserService.getById).toHaveBeenCalledWith('1');
    expect(component.user).toEqual(mockUser);
  });

  it('back should call window.history.back', () => {
    const historySpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(historySpy).toHaveBeenCalled();
  });

  it('delete should call userService.delete, show snackbar, logOut and navigate to home', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const snackBarSpy = jest.spyOn((component as any)['matSnackBar'], 'open');

    component.delete();

    expect(mockUserService.delete).toHaveBeenCalledWith('1');
    expect(snackBarSpy).toHaveBeenCalledWith('Your account has been deleted !', 'Close', { duration: 3000 });
    expect(mockSessionService.logOut).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
