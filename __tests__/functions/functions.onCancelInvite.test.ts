import {Profile} from '../../src/models/Profile';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';

describe('functions.onCancelInvite', () => {
  let inviter: Profile;
  let invitee: Profile;
  let invite: Invite;
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

    invite = {
      from: inviter.uid,
      to: invitee.email,
      createdAt: new Date().getTime(),
      accepted: false,
    };

    adminAPI = createAdminAPI();
    // Client logged in as inviter
    clientAPI = createClientAPI({
      uid: inviter.uid,
      email: inviter.email,
    });
  });

  describe('when the invitee is not a signed up user', () => {
    it('deletes the corresponding email invite', async () => {
      await adminAPI.profiles.set(inviter);

      await clientAPI.invites.addOutgoing(invite);
      await clientAPI.invites.addEmail(invite); // No incoming invite is created

      await clientAPI.invites.deleteOutgoing(inviter.uid, invitee.email);
      await expect(
        adminAPI.invites.waitUntilEmailDeleted(inviter.uid, invite.to),
      ).resolves.toBeTruthy();
    });
  });

  describe('when the invitee is a signed up user', () => {
    it('deletes the corresponding incoming invite', async () => {
      await adminAPI.profiles.set(inviter);
      await adminAPI.profiles.set(invitee);

      await clientAPI.invites.addOutgoing(invite);
      await clientAPI.invites.addEmail(invite); // Incoming invite is created and email invite is deleted
      await adminAPI.invites.waitUntilIncomingExists(invitee.uid, inviter.uid);

      await clientAPI.invites.deleteOutgoing(inviter.uid, invitee.email);
      await expect(
        adminAPI.invites.waitUntilIncomingDeleted(invitee.uid, inviter.uid),
      ).resolves.toBeTruthy();
    });
  });

  afterEach(async () => {
    await clientAPI.destroy();
    await adminAPI.destroy();
  });
});
