import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/service/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: { register: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule, BrowserAnimationsModule, HttpClientModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('submit should call authService.register and navigate to login on success', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });
    component.submit();

    expect(mockAuthService.register).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('submit should set onError to true on error', () => {
    mockAuthService.register.mockReturnValue(throwError(() => new Error('Register failed')));

    component.form.setValue({
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });
    component.submit();

    expect(component.onError).toBe(true);
  });
});
