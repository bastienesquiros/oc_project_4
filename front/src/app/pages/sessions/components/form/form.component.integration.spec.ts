/**
 * Integration tests for FormComponent
 * Tests the component with real SessionApiService, TeacherService and SessionService,
 * using HttpClientTestingModule to intercept HTTP calls.
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';
import { FormComponent } from './form.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';

const mockSessionInfo: SessionInformation = {
  token: 'fake-token',
  type: 'Bearer',
  id: 1,
  username: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  admin: true,
};

const mockTeacher: Teacher = {
  id: 1,
  lastName: 'Doe',
  firstName: 'John',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSession: Session = {
  id: 1,
  name: 'Yoga Session',
  description: 'A great yoga session',
  date: new Date('2024-01-01'),
  teacher_id: 1,
  users: [],
};

describe('FormComponent - Create mode (integration)', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent, RouterTestingModule.withRoutes([]), BrowserAnimationsModule, HttpClientTestingModule],
      providers: [SessionApiService, TeacherService, SessionService],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn(mockSessionInfo);
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();

    // Flush the teachers all() request
    const teacherReq = httpMock.expectOne('api/teacher');
    teacherReq.flush([mockTeacher]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create in create mode with real services', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form in create mode', () => {
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm?.value.name).toBe('');
  });

  it('should load teachers from real TeacherService', () => {
    expect(component.teachers()).toEqual([mockTeacher]);
  });

  it('submit should POST to API and navigate to sessions', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.sessionForm?.setValue({
      name: 'New Yoga',
      date: '2024-06-01',
      teacher_id: 1,
      description: 'A new yoga session',
    });
    component.submit();

    const createReq = httpMock.expectOne('api/session');
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockSession);

    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});

describe('FormComponent - Update mode (integration)', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormComponent, RouterTestingModule.withRoutes([]), BrowserAnimationsModule, HttpClientTestingModule],
      providers: [
        SessionApiService,
        TeacherService,
        SessionService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } } },
        },
        {
          provide: Router,
          useValue: {
            url: '/sessions/update/1',
            navigate: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn(mockSessionInfo);
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();

    // Flush teachers and session detail requests
    const teacherReq = httpMock.expectOne('api/teacher');
    teacherReq.flush([mockTeacher]);
    const sessionReq = httpMock.expectOne('api/session/1');
    sessionReq.flush(mockSession);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create in update mode with real services', () => {
    expect(component).toBeTruthy();
  });

  it('should set onUpdate to true and pre-fill form from API', () => {
    expect(component.onUpdate).toBe(true);
    expect(component.sessionForm?.value.name).toBe('Yoga Session');
  });

  it('submit should PUT to API and navigate to sessions', () => {
    component.submit();

    const updateReq = httpMock.expectOne('api/session/1');
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(mockSession);

    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });
});
