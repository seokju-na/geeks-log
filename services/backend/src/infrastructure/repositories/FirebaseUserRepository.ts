import admin from 'firebase-admin';
import firebase from '../third-parties/firebase';
import Repository from './Repository';

export default class FirebaseUserRepository implements Repository<admin.auth.UserRecord> {
  private readonly auth: admin.auth.Auth;

  constructor() {
    this.auth = firebase.auth();
  }

  async findOneById(userId: string) {
    try {
      return await this.auth.getUser(userId);
    } catch (error) {
      if (this.isUserNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async findOneByEmail(email: string) {
    try {
      return await this.auth.getUserByEmail(email);
    } catch (error) {
      if (this.isUserNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  isUserNotFoundError(error: unknown): boolean {
    return typeof error === 'object'
      && error !== null
      && (error as any).code === 'auth/user-not-found';
  }
}
