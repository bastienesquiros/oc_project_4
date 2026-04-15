/**
 * Integration tests for DetailComponent
 * Tests the component with real SessionApiService, TeacherService and SessionService,
 * using HttpClientTestingModule to intercept HTTP calls.
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { expect } from '@jest/globals';
import { DetailComponent } from './detail.component';
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
  username: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  admin: true,
};

const mockSession: Session = {
  id: 1,
  name: 'Yoga Session',
  description: 'A yoga session',
  date: new Date('2024-01-01'),
  teacher_id: 1,
  users: [2, 3],
};

const mockTeacher: Teacher = {
  id: 1,
  lastName: 'Doe',
  firstName: 'John',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('DetailComponent (integration)', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        SessionApiService,
        TeacherService,
        SessionService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } } },
        },
      ],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn(mockSessionInfo);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Flush the fetchSession() requests triggered by ngOnInit
    const sessionReq = httpMock.expectOne('api/session/1');
    sessionReq.flush(mockSession);
    const teacherReq = httpMock.expectOne('api/teacher/1');
    teacherReq.flush(mockTeacher);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create with real services', () => {
    expect(component).toBeTruthy();
  });

  it('should load session data from real SessionApiService', () => {
    expect(component.session).toEqual(mockSession);
  });

  it('should load teacher data from real TeacherService', () => {
    expect(component.teacher).toEqual(mockTeacher);
  });

  it('isAdmin should be true for admin user', () => {
    expect(component.isAdmin).toBe(true);
  });

  it('isParticipate should be false when userId not in session.users', () => {
    // userId=1, users=[2,3] → not participating
    expect(component.isParticipate).toBe(false);
  });

  it('participate should POST to API and refresh session', () => {
    component.participate();

    const participateReq = httpMock.expectOne('api/session/1/participate/1');
    expect(participateReq.request.method).toBe('POST');
    participateReq.flush(null);

    // Refresh triggers new session detail + teacher requests
    const refreshSessionReq = httpMock.expectOne('api/session/1');
    refreshSessionReq.flush({ ...mockSession, users: [1, 2, 3] });
    const refreshTeacherReq = httpMock.expectOne('api/teacher/1');
    refreshTeacherReq.flush(mockTeacher);
    fixture.detectChanges();
  });
});
