import fs from 'fs';
import path from 'path';
import Chance from 'chance';
import * as firebaseTesting from '@firebase/testing';
import {projectId} from '../index';
import firebase from 'firebase';
import {API} from '../src/API/API';
import {FirebaseAPI} from '../src/API/firebase/FirebaseAPI';

export const rules = fs.readFileSync(
  path.resolve(__dirname, '../../../firestore.rules'), // Path to rules from lib/
  'utf8',
);

export const chance = new Chance();

export type App = firebase.app.App;

export type Auth = {
  uid: string;
  email: string;
};

export const beforeAllTests = async (): Promise<void> => {
  await firebaseTesting.loadFirestoreRules({projectId, rules});
};

export const beforeEachTest = async (): Promise<void> => {
  await firebaseTesting.clearFirestoreData({projectId});
};

const createTestClientApp = (auth: Auth): App =>
  firebaseTesting.initializeTestApp({projectId, auth});
const createTestAdminApp = (): App => firebaseTesting.initializeAdminApp({projectId});

export const createClientAPI = (auth: Auth): API =>
  new FirebaseAPI(createTestClientApp(auth).firestore());
export const createAdminAPI = (): API => new FirebaseAPI(createTestAdminApp().firestore());
