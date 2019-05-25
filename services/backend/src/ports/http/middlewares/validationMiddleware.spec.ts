import * as Joi from '@hapi/joi';
import validationMiddleware from './validationMiddleware';

const mockRequest = jest.fn();
const responseStatusMock = jest.fn();
const mockResponse = jest.fn<any, any[]>(() => ({
  status(statusCode: number) {
    responseStatusMock(statusCode);
    return this;
  },
  send: () => {
  },
  statusCode(statusCode: number) {
    responseStatusMock(statusCode);
  },
}));
const nextMock = jest.fn();

describe('ports.http.middlewares.validationMiddleware', () => {
  afterEach(jest.clearAllMocks);

  test('should send "406" status if validation error caught while validate params.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      params: { a: 123 },
    }));

    const validation = validationMiddleware({
      paramsSchema: {
        a: Joi.string(),
      },
    });
    await validation(mockRequest(), mockResponse(), nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseStatusMock).toHaveBeenCalledWith(406);
  });

  test('should send "406" status if validation error caught while validate body.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      body: { a: 123 },
    }));

    const validation = validationMiddleware({
      bodySchema: {
        a: Joi.string().length(10),
      },
    });
    await validation(mockRequest(), mockResponse(), nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseStatusMock).toHaveBeenCalledWith(406);
  });

  test('should send "406" status if validation error caught while validate query.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      query: { a: 123 },
    }));

    const validation = validationMiddleware({
      querySchema: {
        a: Joi.string(),
      },
    });
    await validation(mockRequest(), mockResponse(), nextMock);

    expect(nextMock).not.toHaveBeenCalled();
    expect(responseStatusMock).toHaveBeenCalledWith(406);
  });

  test('should call next function if all validation passed.', async () => {
    mockRequest.mockImplementationOnce(() => ({
      params: { a: '' },
      body: { a: 'good' },
      query: { a: 123 },
    }));

    const validation = validationMiddleware({
      paramsSchema: {
        a: Joi.string().allow(''),
      },
      bodySchema: {
        a: Joi.string().regex(/good/),
      },
      querySchema: {
        a: Joi.number(),
      },
    });
    await validation(mockRequest(), mockResponse(), nextMock);

    expect(nextMock).toHaveBeenCalled();
    expect(responseStatusMock).not.toHaveBeenCalled();
  });
});
