import ApplicationException from '../seed-work/ApplicationException';

export default function userNotExistsException() {
  return new ApplicationException('app.userNotExists', 'User not exists.');
}
