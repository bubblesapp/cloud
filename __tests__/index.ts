import fs from 'fs';
import path from 'path';
import Chance from 'chance';
import * as firebaseTesting from '@firebase/testing';
import {projectId} from '../index';
import firebase from 'firebase';

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

export const createTestClientApp = (auth: Auth): App => firebaseTesting.initializeTestApp({projectId, auth});

export const createTestAdminClientApp = (): App => firebaseTesting.initializeAdminApp({projectId});
