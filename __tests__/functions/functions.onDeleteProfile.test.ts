import {Profile} from '../../src/models/Profile';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';

describe('functions.onDeleteProfile', () => {
  let inviter: Profile;
  let invitee: Profile;
  let invite: Invite;
  let otherInvitee: Profile;
  let otherInvite: Invite;
  let inviteNotUser: Invite;
  let clientAPIAsInviter: API;
  let clientAPIAsInvitee: API;
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

    otherInvitee = {
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

    otherInvite = {
      from: inviter.uid,
      to: otherInvitee.email,
      createdAt: new Date().getTime(),
      accepted: false,
    };

    inviteNotUser = {
      from: inviter.uid,
      to: chance.email(),
      createdAt: new Date().getTime(),
      accepted: false,
    };

    adminAPI = createAdminAPI();
    // Client logged in as inviter
    clientAPIAsInviter = createClientAPI({
      uid: inviter.uid,
      email: inviter.email,
    });
    // Client logged in as invitee
    clientAPIAsInvitee = createClientAPI({
      uid: invitee.uid,
      email: invitee.email,
    });

    await adminAPI.profiles.set(inviter);
    await adminAPI.profiles.set(invitee);
    await adminAPI.profiles.set(otherInvitee);
  });

  describe('when the invitee is a user and accepted the invite', () => {
    it('deletes friends in both users', async () => {
      await clientAPIAsInviter.invites.addOutgoing(invite);
      await clientAPIAsInviter.invites.addEmail(invite); // Incoming invite is created and email invite is deleted
      await adminAPI.invites.waitUntilIncomingExists(invitee.uid, inviter.uid);
      await clientAPIAsInvitee.invites.accept(invitee.uid, inviter.uid);
      await adminAPI.friends.waitUntilExists(invitee.uid, inviter.uid);
      await adminAPI.friends.waitUntilExists(inviter.uid, invitee.uid);
      await adminAPI.invites.waitUntilOutgoingDeleted(inviter.uid, invitee.email);

      await clientAPIAsInviter.profiles.delete(inviter.uid);

      await expect(
        adminAPI.friends.waitUntilDeleted(invitee.uid, inviter.uid),
      ).resolves.toBeTruthy();
      await expect(
        adminAPI.friends.waitUntilDeleted(inviter.uid, invitee.uid),
      ).resolves.toBeTruthy();
    });
  });

  describe('when the invitee is a user but did not accept the invite', () => {
    it('deletes both outgoing and incoming invites', async () => {
      await clientAPIAsInviter.invites.addOutgoing(otherInvite);
      await clientAPIAsInviter.invites.addEmail(otherInvite); // Incoming invite is created and email invite is deleted
      await adminAPI.invites.waitUntilIncomingExists(otherInvitee.uid, inviter.uid);

      await clientAPIAsInviter.profiles.delete(inviter.uid);

      await expect(
        adminAPI.invites.waitUntilIncomingDeleted(otherInvitee.uid, inviter.uid),
      ).resolves.toBeTruthy();
      await expect(
        adminAPI.invites.waitUntilOutgoingDeleted(inviter.uid, otherInvitee.email),
      ).resolves.toBeTruthy();
    });
  });

  describe('when the invitee is not a user', () => {
    it('deletes both outgoing and email invites', async () => {
      await clientAPIAsInviter.invites.addOutgoing(inviteNotUser);
      await clientAPIAsInviter.invites.addEmail(inviteNotUser); // No incoming invite is created

      await clientAPIAsInviter.profiles.delete(inviter.uid);

      await expect(
        adminAPI.invites.waitUntilEmailDeleted(inviter.uid, inviteNotUser.to),
      ).resolves.toBeTruthy();
      await expect(
        adminAPI.invites.waitUntilOutgoingDeleted(inviter.uid, inviteNotUser.to),
      ).resolves.toBeTruthy();
    });
  });

  it("deletes the user's bubble", async () => {
    await clientAPIAsInviter.profiles.delete(inviter.uid);

    await expect(adminAPI.bubble.waitUntilDeleted(inviter.uid)).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await clientAPIAsInviter.destroy();
    await clientAPIAsInvitee.destroy();
    await adminAPI.destroy();
  });
});
