import {Profile} from '../../src/models/Profile';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';

describe('functions.onCreateProfile', () => {
  let inviter: Profile;
  let otherInviter: Profile;
  let profile: Profile;
  let invite: Invite;
  let otherInvite: Invite;
  let clientAPIAsInviter: API;
  let clientAPIAsOtherInviter: API;
  let clientAPIAsProfile: API;
  let adminAPI: API;

  beforeAll(async () => await beforeAllTests());

  beforeEach(async () => {
    await beforeEachTest();

    inviter = {
      uid: chance.guid(),
      name: chance.name(),
      email: chance.email(),
    };

    otherInviter = {
      uid: chance.guid(),
      name: chance.name(),
      email: chance.email(),
    };

    profile = {
      uid: chance.guid(),
      name: chance.name(),
      email: chance.email(),
    };

    invite = {
      from: inviter.uid,
      to: profile.email,
      createdAt: new Date().getTime(),
      accepted: false,
    };

    otherInvite = {
      from: otherInviter.uid,
      to: profile.email,
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
    clientAPIAsOtherInviter = createClientAPI({
      uid: otherInviter.uid,
      email: otherInviter.email,
    });

    // Client logged in as inviter
    clientAPIAsProfile = createClientAPI({
      uid: profile.uid,
      email: profile.email,
    });
  });

  it('creates the bubble', async () => {
    await clientAPIAsProfile.profiles.set(profile);
    await expect(adminAPI.bubble.waitUntilExists(profile.uid)).resolves.toBeTruthy();
  });

  it('adds incoming invites for pending email invites', async () => {
    await clientAPIAsInviter.invites.addOutgoing(invite);
    await clientAPIAsInviter.invites.addEmail(invite);

    await clientAPIAsOtherInviter.invites.addOutgoing(otherInvite);
    await clientAPIAsOtherInviter.invites.addEmail(otherInvite);

    await clientAPIAsProfile.profiles.set(profile);

    await expect(
      adminAPI.invites.waitUntilIncomingExists(profile.uid, inviter.uid),
    ).resolves.toBeTruthy();

    await expect(
      adminAPI.invites.waitUntilEmailDeleted(inviter.uid, profile.email),
    ).resolves.toBeTruthy();

    await expect(
      adminAPI.invites.waitUntilIncomingExists(profile.uid, otherInviter.uid),
    ).resolves.toBeTruthy();

    await expect(
      adminAPI.invites.waitUntilEmailDeleted(otherInviter.uid, profile.email),
    ).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await clientAPIAsOtherInviter.destroy();
    await clientAPIAsInviter.destroy();
    await clientAPIAsProfile.destroy();
    await adminAPI.destroy();
  });
});
