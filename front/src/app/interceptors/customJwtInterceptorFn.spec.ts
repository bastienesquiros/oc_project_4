import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { expect } from '@jest/globals';
import { customJwtInterceptorFn } from './customJwtInterceptorFn';
import { SessionService } from '../core/service/session.service';
import { SessionInformation } from '../core/models/sessionInformation.interface';

const mockSessionInfo: SessionInformation = {
  token: 'test-token',
  type: 'Bearer',
  id: 1,
  username: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
  admin: false,
};

describe('customJwtInterceptorFn', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let sessionService: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([customJwtInterceptorFn])),
        provideHttpClientTesting(),
        SessionService,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    sessionService = TestBed.inject(SessionService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when logged in', () => {
    sessionService.logIn(mockSessionInfo);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({});
  });

  it('should not add Authorization header when not logged in', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('should pass through the request unchanged when not logged in', () => {
    httpClient.get('/api/test', { params: { foo: 'bar' } }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/test');
    expect(req.request.params.get('foo')).toBe('bar');
    req.flush({});
  });
});
