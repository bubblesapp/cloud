import {Invite} from '../../src/models/Invite';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {Profile} from '../../src/models/Profile';
import {API} from '../../src/API/API';

describe.only('functions.onAcceptInvite', () => {
  let inviter: Profile;
  let invitee: Profile;
  let clientAPI: API;
  let adminAPI: API;

  beforeAll(async () => await beforeAllTests());

  beforeEach(async () => {
    await beforeEachTest();

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

    adminAPI = createAdminAPI();
    clientAPI = createClientAPI({
      uid: invitee.uid,
      email: invitee.email,
    });

    await adminAPI.profiles.set(inviter);
    await adminAPI.profiles.set(invitee);

    // Pre-populate outgoing invite
    await adminAPI.invites.addOutgoing(invite);

    // Not creating email invite,
    // so manually pre-populate incoming invite
    await adminAPI.invites.setIncoming(invitee.uid, invite);
  });

  it("adds inviter to invitee's bubble", async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid);
    await expect(adminAPI.friends.waitUntilExists(invitee.uid, inviter.uid)).resolves.toBeTruthy();
  });

  it("adds invitee to inviter's bubble", async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid);
    await expect(adminAPI.friends.waitUntilExists(inviter.uid, invitee.uid)).resolves.toBeTruthy();
  });

  it('deletes the outgoing invite from the inviter', async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid);
    await expect(
      adminAPI.invites.waitUntilOutgoingDeleted(inviter.uid, invitee.email),
    ).resolves.toBeTruthy();
  });

  it('deletes the incoming invite from the invitee', async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid);
    await expect(
      adminAPI.invites.waitUntilIncomingDeleted(invitee.uid, inviter.uid),
    ).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await clientAPI.destroy();
    await adminAPI.destroy();
  });
});
