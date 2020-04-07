import {Profile} from '../../src/models/Profile';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';

describe('functions.onDeleteFriend', () => {
  let inviter: Profile;
  let invitee: Profile;
  let invite: Invite;
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

    invite = {
      from: inviter.uid,
      to: invitee.email,
      createdAt: new Date().getTime(),
      accepted: false,
    };

    adminAPI = createAdminAPI();
    // Client logged in as inviter
    clientAPIAsInviter = createClientAPI({
      uid: inviter.uid,
      email: inviter.email,
    });

    // Client logged in as inviter
    clientAPIAsInvitee = createClientAPI({
      uid: invitee.uid,
      email: invitee.email,
    });

    await adminAPI.profiles.set(inviter);
    await adminAPI.profiles.set(invitee);
  });

  it("removes user from the deleted friend's bubble", async () => {
    await clientAPIAsInviter.invites.addOutgoing(invite);
    await clientAPIAsInviter.invites.addEmail(invite); // No incoming invite is created
    await adminAPI.invites.waitUntilIncomingExists(invitee.uid, inviter.uid);

    await clientAPIAsInvitee.invites.accept(invitee.uid, inviter.uid);
    await adminAPI.friends.waitUntilExists(invitee.uid, inviter.uid);
    await adminAPI.friends.waitUntilExists(inviter.uid, invitee.uid);

    await clientAPIAsInvitee.friends.delete(inviter.uid, invitee.uid);

    await expect(adminAPI.friends.waitUntilDeleted(inviter.uid, invitee.uid)).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await clientAPIAsInviter.destroy();
    await clientAPIAsInvitee.destroy();
    await adminAPI.destroy();
  });
});
