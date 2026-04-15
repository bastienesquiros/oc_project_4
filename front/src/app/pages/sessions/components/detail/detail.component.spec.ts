import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { DetailComponent } from './detail.component';
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

const mockSessionService = {
  sessionInformation: {
    admin: true,
    id: 1,
    token: 'fake-token',
    type: 'Bearer',
    username: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
  },
};

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let mockSessionApiService: {
    detail: jest.Mock;
    delete: jest.Mock;
    participate: jest.Mock;
    unParticipate: jest.Mock;
  };
  let mockTeacherService: { detail: jest.Mock };
  let mockSnackBar: { open: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      delete: jest.fn().mockReturnValue(of(void 0)),
      participate: jest.fn().mockReturnValue(of(void 0)),
      unParticipate: jest.fn().mockReturnValue(of(void 0)),
    };
    mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(mockTeacher)),
    };
    mockSnackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [DetailComponent, RouterTestingModule, HttpClientModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isAdmin should be set from sessionService', () => {
    expect(component.isAdmin).toBe(true);
  });

  it('ngOnInit should load session and teacher data', () => {
    expect(mockSessionApiService.detail).toHaveBeenCalled();
    expect(mockTeacherService.detail).toHaveBeenCalled();
    expect(component.session).toEqual(mockSession);
    expect(component.teacher).toEqual(mockTeacher);
  });

  it('isParticipate should be true if userId is in session.users', () => {
    // userId=1 is in users=[1, 2]
    expect(component.isParticipate).toBe(true);
  });

  it('back should call window.history.back', () => {
    const historySpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(historySpy).toHaveBeenCalled();
  });

  it('delete should call sessionApiService.delete, show snackbar and navigate', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const snackBarSpy = jest.spyOn((component as any)['matSnackBar'], 'open');

    component.delete();

    expect(mockSessionApiService.delete).toHaveBeenCalled();
    expect(snackBarSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });

  it('participate should call sessionApiService.participate and refresh session', () => {
    const callsBefore = mockSessionApiService.detail.mock.calls.length;
    component.participate();
    expect(mockSessionApiService.participate).toHaveBeenCalled();
    expect(mockSessionApiService.detail.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('should show Delete button when isAdmin is true', () => {
    fixture.detectChanges();
    const deleteButton = fixture.nativeElement.querySelector('button[color="warn"]');
    expect(deleteButton).toBeTruthy();
    expect(deleteButton.textContent).toContain('Delete');
  });

  it('should not show Delete button when isAdmin is false', async () => {
    // Rebuild with non-admin session
    const nonAdminService = { sessionInformation: { admin: false, id: 1 } };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DetailComponent, RouterTestingModule, HttpClientModule],
      providers: [
        { provide: SessionService, useValue: nonAdminService },
        { provide: SessionApiService, useValue: { detail: jest.fn().mockReturnValue(of(mockSession)), delete: jest.fn(), participate: jest.fn(), unParticipate: jest.fn() } },
        { provide: TeacherService, useValue: { detail: jest.fn().mockReturnValue(of(mockTeacher)) } },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: jest.fn().mockReturnValue('1') } } } },
      ],
    }).compileComponents();
    const nonAdminFixture = TestBed.createComponent(DetailComponent);
    nonAdminFixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = nonAdminFixture.nativeElement.querySelectorAll('button');
    const deleteButton = Array.from(buttons).find(b => b.textContent?.includes('Delete'));
    expect(deleteButton).toBeUndefined();
  });
});
