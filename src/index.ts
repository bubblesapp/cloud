import admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const firebaseFunctions = functions.region('europe-west1');

export const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
