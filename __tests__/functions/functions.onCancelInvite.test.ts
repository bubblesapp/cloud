import {Profile} from '../../src/models/Profile';
import {App, chance, createTestAdminClientApp, createTestClientApp, rules} from '../index';
import * as firebaseTesting from '@firebase/testing';
import {projectId} from '../../index';
import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';
import {TestAPI} from '../TestAPI';

describe('functions.onCancelInvite', () => {
  let inviter: Profile;
  let invitee: Profile;
  let invite: Invite;
  let client: App;
  let admin: App;

  beforeAll(async () => {
    await firebaseTesting.loadFirestoreRules({projectId, rules});
  });

  beforeEach(async () => {
    await firebaseTesting.clearFirestoreData({projectId});

    inviter = {
      uid: chance.guid(),
      name: chance.name(),
      email: chance.email(),
    };

    invitee = {
      uid: chance.guid(),
      name: chance.name(),
      email: chance.email(),
    };

    invite = {
      from: inviter.uid,
      to: invitee.email,
      createdAt: new Date().getTime(),
      accepted: false,
    };

    admin = createTestAdminClientApp();
    // Client logged in as inviter
    client = createTestClientApp({
      uid: inviter.uid,
      email: invitee.email,
    });
  });

  describe('when the invitee is not a signed up user', () => {
    it('deletes the corresponding email invite', async () => {
      await API.createProfile(admin.firestore(), inviter);

      await API.createOutgoingInvite(admin.firestore(), invite);
      await API.createEmailInvite(admin.firestore(), invite); // Creates the incoming invite

      await API.deleteOutgoingInvite(client.firestore(), inviter.uid, invitee.email);
      await expect(TestAPI.waitUntilEmailInviteDeleted(admin, invite.to)).resolves.toBeTruthy();
    });
  });

  describe('when the invitee is a signed up user', () => {
    it('deletes the corresponding incoming invite', async () => {
      await API.createProfile(admin.firestore(), inviter);
      await API.createProfile(admin.firestore(), invitee);

      await API.createOutgoingInvite(admin.firestore(), invite);
      await API.createEmailInvite(admin.firestore(), invite); // Creates the incoming invite and deletes the email invite
      await TestAPI.waitUntilIncomingInviteExists(admin, invitee.uid, inviter.uid);

      await API.deleteOutgoingInvite(client.firestore(), inviter.uid, invitee.email);
      await expect(TestAPI.waitUntilIncomingInviteDeleted(admin, invitee.uid, inviter.uid)).resolves.toBeTruthy();
    });
  });

  afterEach(async () => {
    await client.delete();
    await admin.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
