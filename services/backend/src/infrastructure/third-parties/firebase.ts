import * as admin from 'firebase-admin';
import environment from '../../environment';

admin.initializeApp({
  projectId: environment.config.FirebaseProjectId,
  credential: admin.credential.cert(environment.config.FirebaseCredentials!),
});

export default admin;
