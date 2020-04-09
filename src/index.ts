import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import {API} from '@bubblesapp/api';
import {FirebaseAPI} from '@bubblesapp/api';

let projectId;
if (process.env.FIREBASE_CONFIG) {
  projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
} else if (process.env.GCLOUD_PROJECT) {
  projectId = JSON.parse(process.env.GCLOUD_PROJECT);
}

export {projectId};

export const firebaseFunctions = functions.region('europe-west1');

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const adminAPI: API = new FirebaseAPI(app);
