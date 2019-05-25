import admin from 'firebase-admin';
import firebase from '../third-parties/firebase';
import Authorizer from './Authorizer';

export default class FirebaseAuthorizer implements Authorizer {
  private readonly auth: admin.auth.Auth;

  constructor() {
    this.auth = firebase.auth();
  }

  async authenticate(token: string) {
    try {
      return await this.auth.verifyIdToken(token);
    } catch (error) {
      return null;
    }
  }
}
