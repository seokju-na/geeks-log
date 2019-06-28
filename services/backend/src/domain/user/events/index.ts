import UserCreatedEvent from './UserCreatedEvent';
import UserLoggedInEvent from './UserLoggedInEvent';

type UserEvent =
  UserCreatedEvent
  | UserLoggedInEvent;

export default UserEvent;
