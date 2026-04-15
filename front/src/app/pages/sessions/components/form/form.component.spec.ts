import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { FormComponent } from './form.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';

const mockSession: Session = {
  id: 1,
  name: 'Yoga Session',
  description: 'A yoga session',
  date: new Date('2024-01-01'),
  teacher_id: 1,
  users: [1, 2],
};

const mockTeacher: Teacher = {
  id: 1,
  lastName: 'Doe',
  firstName: 'John',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildMockSessionApiService() {
  return {
    create: jest.fn().mockReturnValue(of(mockSession)),
    update: jest.fn().mockReturnValue(of(mockSession)),
    detail: jest.fn().mockReturnValue(of(mockSession)),
  };
}

function buildMockTeacherService() {
  return { all: jest.fn().mockReturnValue(of([mockTeacher])) };
}

describe('FormComponent - Create mode', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let mockSessionApiService: ReturnType<typeof buildMockSessionApiService>;
  let mockTeacherService: ReturnType<typeof buildMockTeacherService>;
  let mockSnackBar: { open: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    mockSessionApiService = buildMockSessionApiService();
    mockTeacherService = buildMockTeacherService();
    mockSnackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [FormComponent, RouterTestingModule.withRoutes([]), BrowserAnimationsModule, HttpClientModule],
      providers: [
        { provide: SessionService, useValue: { sessionInformation: { admin: true } } },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode with empty form', () => {
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
    expect(component.sessionForm?.value.name).toBe('');
  });

  it('should navigate to sessions if user is not admin', async () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    // Reconfigure with non-admin user
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [FormComponent, RouterTestingModule.withRoutes([]), BrowserAnimationsModule, HttpClientModule],
      providers: [
        { provide: SessionService, useValue: { sessionInformation: { admin: false } } },
        { provide: SessionApiService, useValue: buildMockSessionApiService() },
        { provide: TeacherService, useValue: buildMockTeacherService() },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
      ],
    }).compileComponents();

    const nonAdminFixture = TestBed.createComponent(FormComponent);
    const nonAdminRouter = TestBed.inject(Router);
    const nonAdminNavigateSpy = jest.spyOn(nonAdminRouter, 'navigate');
    nonAdminFixture.detectChanges();

    expect(nonAdminNavigateSpy).toHaveBeenCalledWith(['/sessions']);
    void navigateSpy; // suppress unused warning
  });

  it('submit button should be disabled when form is invalid', () => {
    fixture.detectChanges();
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('submit button should be enabled when form is valid', () => {
    component.sessionForm?.setValue({
      name: 'Yoga',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'A great yoga session',
    });
    fixture.detectChanges();
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(false);
  });

  it('submit should call sessionApiService.create and navigate to sessions', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const snackBarSpy = jest.spyOn((component as any)['matSnackBar'], 'open');

    component.sessionForm?.setValue({
      name: 'New Session',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'Test description',
    });
    component.submit();

    expect(mockSessionApiService.create).toHaveBeenCalled();
    expect(snackBarSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});

describe('FormComponent - Update mode', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let mockSessionApiService: ReturnType<typeof buildMockSessionApiService>;
  let mockTeacherService: ReturnType<typeof buildMockTeacherService>;
  let mockSnackBar: { open: jest.Mock };
  let mockRouter: { url: string; navigate: jest.Mock };

  beforeEach(async () => {
    mockSessionApiService = buildMockSessionApiService();
    mockTeacherService = buildMockTeacherService();
    mockSnackBar = { open: jest.fn() };
    mockRouter = { url: '/sessions/update/1', navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [FormComponent, RouterTestingModule.withRoutes([]), BrowserAnimationsModule, HttpClientModule],
      providers: [
        { provide: SessionService, useValue: { sessionInformation: { admin: true } } },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } } },
        },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in update mode', () => {
    expect(component).toBeTruthy();
  });

  it('should set onUpdate to true when URL contains update', () => {
    expect(component.onUpdate).toBe(true);
  });

  it('should load session data and pre-fill form', () => {
    expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
    expect(component.sessionForm?.value.name).toBe('Yoga Session');
  });

  it('submit should call sessionApiService.update and navigate to sessions', () => {
    const snackBarSpy = jest.spyOn((component as any)['matSnackBar'], 'open');

    component.submit();

    expect(mockSessionApiService.update).toHaveBeenCalledWith('1', expect.any(Object));
    expect(snackBarSpy).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });
});
