import Event from '../../seed-work/Event';

interface BasePayload {
  email: string;
  name: string;
}

interface LocalUserCreatedEventPayload extends BasePayload {
  type: 'local';
  salt: string;
  passwordDigest: string;
}

interface OAuthUserCreatedEventPayload extends BasePayload {
  type: 'oauth';
  provider: string;
}

type Payload = LocalUserCreatedEventPayload | OAuthUserCreatedEventPayload;

export default interface UserCreatedEvent extends Event {
  type: 'UserCreated';
  payload: Payload;
}
