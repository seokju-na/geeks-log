import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export default class LoggingMiddleware implements NestMiddleware {
  use(...args) {
    return function logRequest(request, response, next) {
      console.log(request.baseUrl, JSON.stringify(request.body));
      next();
    };
  }
}
