import * as firebaseTesting from '@firebase/testing';
import {Invite} from '../../src/models/Invite';
import {projectId} from '../../index';
import {App, chance, createTestAdminClientApp, createTestClientApp, rules} from '../index';
import {API} from '../../src/API/API';
import {TestAPI} from '../TestAPI';
import {Profile} from '../../src/models/Profile';

describe.only('functions.onAcceptInvite', () => {
  let inviter: Profile;
  let invitee: Profile;
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

    const invite: Invite = {
      from: inviter.uid,
      to: invitee.email,
      createdAt: new Date().getTime(),
      accepted: false,
    };

    admin = createTestAdminClientApp();
    client = createTestClientApp({
      uid: invitee.uid,
      email: invitee.email,
    });

    await API.createProfile(admin.firestore(), inviter);
    await API.createProfile(admin.firestore(), invitee);

    // Pre-populate outgoing invite
    await API.createOutgoingInvite(admin.firestore(), invite);

    // Not creating email invite,
    // so manually pre-populate incoming invite
    await API.createIncomingInvite(admin.firestore(), invite, invitee.uid);
  });

  it("adds inviter to invitee's bubble", async () => {
    await API.acceptInvite(client.firestore(), invitee.uid, inviter.uid);
    await expect(TestAPI.waitUntilFriendExists(admin, invitee.uid, inviter.uid)).resolves.toBeTruthy();
  });

  it("adds invitee to inviter's bubble", async () => {
    await API.acceptInvite(client.firestore(), invitee.uid, inviter.uid);
    await expect(TestAPI.waitUntilFriendExists(admin, inviter.uid, invitee.uid)).resolves.toBeTruthy();
  });

  it('deletes the outgoing invite from the inviter', async () => {
    await API.acceptInvite(client.firestore(), invitee.uid, inviter.uid);
    await expect(TestAPI.waitUntilOutgoingInviteDeleted(admin, inviter.uid, invitee.uid)).resolves.toBeTruthy();
  });

  it('deletes the incoming invite from the inviter', async () => {
    await API.acceptInvite(client.firestore(), invitee.uid, inviter.uid);
    await expect(TestAPI.waitUntilIncomingInviteDeleted(admin, inviter.uid, invitee.uid)).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await client.delete();
    await admin.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
