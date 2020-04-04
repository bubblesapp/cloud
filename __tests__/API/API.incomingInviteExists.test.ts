import * as firebaseTesting from '@firebase/testing';
import {Invite} from '../../src/models/Invite';
import {chance, rules} from '../index';
import {projectId} from '../../index';
import {API} from '../../src/API/API';
import firebaseAdmin from 'firebase-admin';

describe('incomingInviteExists', () => {
  let testApp: firebaseAdmin.app.App;
  let toUid: string;
  let invite: Invite;

  beforeAll(async () => {
    await firebaseTesting.loadFirestoreRules({projectId, rules});
  });

  beforeEach(async () => {
    await firebaseTesting.clearFirestoreData({projectId});
    testApp = firebaseAdmin.initializeApp({projectId}, chance.guid());

    invite = {
      from: chance.guid(),
      to: chance.email(),
      createdAt: new Date().getTime(),
      accepted: false,
    };

    toUid = chance.guid();

    await testApp.firestore().collection('users').doc(toUid).collection('incomingInvites').doc(invite.from).set(invite);
  });

  it('returns true if an incoming invite exists', async () => {
    const exists = await API.incomingInviteExists(testApp.firestore(), invite.from, toUid);
    expect(exists).toBeTruthy();
  });

  it("returns false if an incoming invite doesn't exists", async () => {
    const exists = await API.incomingInviteExists(testApp.firestore(), invite.from, chance.guid());
    expect(exists).toBeFalsy();
  });

  afterEach(async () => {
    await testApp.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
