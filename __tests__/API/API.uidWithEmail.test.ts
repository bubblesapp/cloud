import * as firebaseTesting from '@firebase/testing';
import {Profile} from '../../src/models/Profile';
import {chance, rules} from '../index';
import {projectId} from '../../index';
import {API} from '../../src/API/API';
import firebaseAdmin from 'firebase-admin';

describe('uidWithEmail', () => {
  let testApp: firebaseAdmin.app.App;
  let adminFirestore;

  beforeAll(async () => {
    await firebaseTesting.loadFirestoreRules({projectId, rules});
  });

  beforeEach(async () => {
    await firebaseTesting.clearFirestoreData({projectId});
    testApp = firebaseAdmin.initializeApp({projectId}, chance.guid());
    adminFirestore = testApp.firestore();
  });

  it('returns the uid of the profile with the given email', async () => {
    const profile: Profile = {
      uid: chance.guid(),
      email: chance.email(),
      name: chance.name(),
    };

    await adminFirestore.collection('profiles').doc(profile.uid).set(profile);

    const uid = await API.uidWihEmail(adminFirestore, profile.email);
    expect(uid).toEqual(profile.uid);
  });

  it('returns undefined if no user exists with the given email', async () => {
    const profile: Profile = {
      uid: chance.guid(),
      email: chance.email(),
      name: chance.name(),
    };

    await adminFirestore.collection('profiles').doc(profile.uid).set(profile);

    const uid = await API.uidWihEmail(adminFirestore, chance.email());
    expect(uid).toBeUndefined();
  });

  afterEach(async () => {
    await testApp.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
