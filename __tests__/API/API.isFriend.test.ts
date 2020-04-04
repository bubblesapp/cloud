import {Friend} from '../../src/models/Friend';
import * as firebaseTesting from '@firebase/testing';
import {projectId} from '../../index';
import {chance, rules} from '../index';
import {API} from '../../src/API/API';
import firebaseAdmin from 'firebase-admin';

describe('isFriend', () => {
  let app: firebaseAdmin.app.App;
  let adminFirestore;

  beforeAll(async () => {
    await firebaseTesting.loadFirestoreRules({projectId, rules});
  });

  beforeEach(async () => {
    await firebaseTesting.clearFirestoreData({projectId});
    app = firebaseAdmin.initializeApp({projectId}, chance.guid());
    adminFirestore = app.firestore();
  });

  it('returns false if A is not friend of B', async () => {
    const friend: Friend = {
      uid: chance.guid(),
      lastMet: new Date().getTime(),
    };

    const exists = await API.isFriend(adminFirestore, friend.uid, chance.guid());
    expect(exists).toBeFalsy();
  });

  it('returns true if A is friend of B', async () => {
    const friend: Friend = {
      uid: chance.guid(),
      lastMet: new Date().getTime(),
    };

    const uid = chance.guid();
    await adminFirestore.collection('users').doc(uid).collection('friends').doc(friend.uid).set(friend);

    const exists = await API.isFriend(adminFirestore, friend.uid, uid);
    expect(exists).toBeTruthy();
  });

  afterEach(async () => {
    await app.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((a) => a.delete()));
  });
});
