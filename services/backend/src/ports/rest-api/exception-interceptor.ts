import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppExceptionCodes } from '../../app/exceptions';
import { AppException, isAppException } from '../../app/shared/app-exception';
import { AuthExceptionCodes } from '../../infra/auth/exceptions';
import { EventstoreExceptionCodes } from '../../infra/eventstore/exceptions';
import { InfraException, isInfraException } from '../../infra/shared';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next
      .handle()
      .pipe(
        catchError(exception => throwError(this.transformException(exception))),
      );
  }

  private transformException(exception: unknown) {
    if (isAppException(exception)) {
      return this.transformAppException(exception);
    } else if (isInfraException(exception)) {
      return this.transformInfraException(exception);
    } else {
      return new InternalServerErrorException();
    }
  }

  private transformAppException(exception: AppException) {
    switch (exception.code) {
      case AppExceptionCodes.USER_EMAIL_DUPLICATED:
      case AppExceptionCodes.USER_NAME_DUPLICATED:
        return new NotAcceptableException(exception.code);
      case AppExceptionCodes.USER_NOT_FOUND:
        return new NotFoundException(exception.code);
    }
  }

  private transformInfraException(exception: InfraException) {
    switch (exception.code) {
      case AuthExceptionCodes.USER_UNAUTHORIZED:
        return new UnauthorizedException();
      case EventstoreExceptionCodes.STREAM_NOT_FOUND:
        return new NotFoundException();
      case EventstoreExceptionCodes.STREAM_DELETED:
        return new ForbiddenException();
    }
  }
}
