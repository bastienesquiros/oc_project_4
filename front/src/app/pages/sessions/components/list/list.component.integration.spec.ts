/**
 * Integration tests for ListComponent
 * Tests the component with real SessionApiService and real SessionService,
 * using HttpClientTestingModule to intercept HTTP calls.
 */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { expect } from '@jest/globals';
import { ListComponent } from './list.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionInformation } from '../../../../core/models/sessionInformation.interface';

const mockAdminSession: SessionInformation = {
  token: 'fake-token',
  type: 'Bearer',
  id: 1,
  username: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  admin: true,
};

const mockSessions: Session[] = [
  {
    id: 1,
    name: 'Morning Yoga',
    description: 'A relaxing morning yoga session',
    date: new Date('2024-06-01'),
    teacher_id: 1,
    users: [1, 2],
  },
  {
    id: 2,
    name: 'Evening Pilates',
    description: 'An evening pilates session',
    date: new Date('2024-06-02'),
    teacher_id: 2,
    users: [],
  },
];

describe('ListComponent (integration)', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let sessionService: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [SessionApiService, SessionService],
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn(mockAdminSession);
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Flush the all() request triggered by toSignal
    const req = httpMock.expectOne('api/session');
    req.flush(mockSessions);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create with real services', () => {
    expect(component).toBeTruthy();
  });

  it('should load sessions from real SessionApiService', () => {
    expect(component.sessions()).toEqual(mockSessions);
  });

  it('user getter should return the logged-in sessionInformation', () => {
    expect(component.user).toEqual(mockAdminSession);
  });

  it('should expose admin status through the user getter', () => {
    expect(component.user?.admin).toBe(true);
  });

  it('sessions signal should reflect the number of sessions returned by the API', () => {
    expect(component.sessions().length).toBe(2);
  });
});
