import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { expect } from '@jest/globals';
import { AppComponent } from './app.component';
import { SessionService } from './core/service/session.service';
import { SessionInformation } from './core/models/sessionInformation.interface';

describe('AppComponent', () => {
  let router: Router;
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule, HttpClientModule, MatToolbarModule],
    }).compileComponents();
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('isLogged should be false by default', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.isLogged()).toBe(false);
  });

  it('isLogged should be true after logIn', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockSessionInfo: SessionInformation = {
      token: 'fake-token',
      type: 'Bearer',
      id: 1,
      username: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      admin: false,
    };
    sessionService.logIn(mockSessionInfo);
    fixture.detectChanges();
    expect(app.isLogged()).toBe(true);
  });

  it('logout should call sessionService.logOut and navigate to home', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const logOutSpy = jest.spyOn(sessionService, 'logOut');
    const navigateSpy = jest.spyOn(router, 'navigate');

    app.logout();

    expect(logOutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['']);
  });
});
