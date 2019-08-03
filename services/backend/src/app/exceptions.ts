import { AppException } from './shared/app-exception';

export enum AppExceptionCodes {
  USER_EMAIL_DUPLICATED = 'app.userEmailDuplicated',
  USER_NAME_DUPLICATED = 'app.userNameDuplicated',
  USER_NOT_FOUND = 'app.userNotFound',
}

export function userEmailDuplicatedException() {
  return new AppException(AppExceptionCodes.USER_EMAIL_DUPLICATED);
}

export function usernameDuplicatedException() {
  return new AppException(AppExceptionCodes.USER_NAME_DUPLICATED);
}
