import Authorizer, { AuthClaims } from '../../../infrastructure/authentication/Authorizer';
import authMiddleware, { getAuthClaimsFromRequest } from './authMiddleware';

const mockRequest = jest.fn();
const mockResponseStatus = jest.fn();
const mockResponse = jest.fn<any, any[]>(() => ({
  status(statusCode: number) {
    mockResponseStatus(statusCode);
    return this;
  },
  send: () => {
  },
}));
const mockNext = jest.fn();
const mockAuthenticate = jest.fn();
const mockAuthorizer = jest.fn<Authorizer, any[]>(() => ({
  authenticate: mockAuthenticate,
}))();

describe('ports.http.middlewares.authMiddleware', () => {
  afterEach(jest.clearAllMocks);

  test('should response with 403 error code if "authorization" header is empty ' +
    'and "throwErrorWhenUnauthorized" options is true.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      headers: { authorization: undefined },
    }));

    const auth = authMiddleware({ authorizer: mockAuthorizer });
    await auth(mockRequest(), mockResponse(), mockNext);

    expect(mockResponseStatus).toHaveBeenCalledWith(403);
  });

  test('should auth claims is null if "authorization" header is empty and ' +
    '"throwErrorWhenUnauthorized" options is false.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      headers: { authorization: undefined },
    }));

    const request = mockRequest();
    const auth = authMiddleware({
      authorizer: mockAuthorizer,
      throwErrorWhenUnauthorized: false,
    });
    await auth(request, mockResponse(), mockNext);

    expect(getAuthClaimsFromRequest(request)).toBeNull();
    expect(mockNext).toHaveBeenCalled();
  });

  test('should response with 403 error code if "authorization" header is not ' +
    'start with "Bearer " and "throwErrorWhenUnauthorized" options is true.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      headers: { authorization: 'Token 123' },
    }));

    const auth = authMiddleware({ authorizer: mockAuthorizer });
    await auth(mockRequest(), mockResponse(), mockNext);

    expect(mockResponseStatus).toHaveBeenCalledWith(403);
  });

  test('should auth claims is null if "authorization" header is not start with ' +
    '"Bearer" and "throwErrorWhenUnauthorized" options is false.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      headers: { authorization: 'this_is_not_token' },
    }));

    const request = mockRequest();
    const auth = authMiddleware({
      authorizer: mockAuthorizer,
      throwErrorWhenUnauthorized: false,
    });
    await auth(request, mockResponse(), mockNext);

    expect(getAuthClaimsFromRequest(request)).toBeNull();
    expect(mockNext).toHaveBeenCalled();
  });

  test('should set auth claims if can get user with token.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      headers: { authorization: 'Bearer token' },
    }));

    const authClaims: AuthClaims = { sub: 'seokju', uid: '123', iss: 'google' };
    mockAuthenticate.mockImplementationOnce(() => Promise.resolve(authClaims));

    const request = mockRequest();
    const auth = authMiddleware({ authorizer: mockAuthorizer });
    await auth(request, mockResponse(), mockNext);

    expect(getAuthClaimsFromRequest(request)).toEqual(authClaims);
    expect(mockNext).toHaveBeenCalled();
  });

  test('should response with 403 error code if fails during authenticate ' +
    'token.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      headers: { authorization: 'Bearer token' },
    }));

    mockAuthenticate.mockImplementationOnce(() => Promise.reject('some error'));

    const auth = authMiddleware({ authorizer: mockAuthorizer });
    await auth(mockRequest(), mockResponse(), mockNext);

    expect(mockResponseStatus).toHaveBeenCalledWith(403);
  });
});
