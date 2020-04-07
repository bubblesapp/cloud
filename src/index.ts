import admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {FirebaseAPI} from './API/firebase/FirebaseAPI';
import {API} from './API/API';

export const firebaseFunctions = functions.region('europe-west1');

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const adminAPI: API = new FirebaseAPI(firebaseAdmin.firestore());
