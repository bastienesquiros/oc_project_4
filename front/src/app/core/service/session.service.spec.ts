import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionService } from './session.service';
import { SessionInformation } from '../models/sessionInformation.interface';

const mockSessionInfo: SessionInformation = {
  token: 'fake-token',
  type: 'Bearer',
  id: 1,
  username: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  admin: false,
};

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isLogged as false by default', () => {
    expect(service.isLogged).toBe(false);
  });

  it('should have sessionInformation as undefined by default', () => {
    expect(service.sessionInformation).toBeUndefined();
  });

  it('$isLogged should emit false by default', (done) => {
    service.$isLogged().subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });

  it('logIn should set isLogged to true and update sessionInformation', () => {
    service.logIn(mockSessionInfo);
    expect(service.isLogged).toBe(true);
    expect(service.sessionInformation).toEqual(mockSessionInfo);
  });

  it('$isLogged should emit true after logIn', (done) => {
    service.logIn(mockSessionInfo);
    service.$isLogged().subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
  });

  it('logOut should set isLogged to false and clear sessionInformation', () => {
    service.logIn(mockSessionInfo);
    service.logOut();
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  it('$isLogged should emit false after logOut', (done) => {
    service.logIn(mockSessionInfo);
    service.logOut();
    service.$isLogged().subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });
});
