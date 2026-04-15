import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { ListComponent } from './list.component';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { SessionService } from '../../../../core/service/session.service';
import { Session } from '../../../../core/models/session.interface';

const mockSessions: Session[] = [
  {
    id: 1,
    name: 'Yoga Session',
    description: 'A yoga session',
    date: new Date('2024-01-01'),
    teacher_id: 1,
    users: [1, 2],
  },
];

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockSessionApiService: { all: jest.Mock };
  let mockSessionService: { sessionInformation: object };

  beforeEach(async () => {
    mockSessionApiService = {
      all: jest.fn().mockReturnValue(of(mockSessions)),
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
    };

    await TestBed.configureTestingModule({
      imports: [ListComponent, RouterTestingModule, HttpClientModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('user getter should return sessionInformation', () => {
    expect(component.user).toEqual(mockSessionService.sessionInformation);
  });

  it('should show Create button for admin user', () => {
    fixture.detectChanges();
    const createButton = fixture.nativeElement.querySelector('button[routerLink="create"]');
    expect(createButton).toBeTruthy();
  });

  it('should not show Create button for non-admin user', async () => {
    mockSessionService.sessionInformation = { ...mockSessionService.sessionInformation, admin: false };
    fixture.detectChanges();
    const createButton = fixture.nativeElement.querySelector('button[routerLink="create"]');
    expect(createButton).toBeNull();
  });
});
