import { Dummy, EmailDummy, StringIdDummy, TextDummy, TimestampDummy } from '@geeks-log/testing';
import { UserAuth } from './types';

export class UserAuthDummy extends Dummy<UserAuth> {
  private id = new StringIdDummy('userAuth');
  private email = new EmailDummy();
  private name = new TextDummy('some-name');
  private timestamp = new TimestampDummy();

  create() {
    return {
      id: this.id.create(),
      email: this.email.create(),
      name: this.name.create(),
      encryptedPassword: 'encryptedPassword',
      salt: 'salt',
      lastLoginTimestamp: this.timestamp.create(),
    };
  }
}
