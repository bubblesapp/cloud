import {Invite, Profile, API} from '@bubblesapp/api';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {expect} from 'chai';

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

  before(async () => await beforeAllTests());

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
    const result = await adminAPI.bubble.waitUntilExists(profile.uid);
    expect(result).to.be.true;
  });

  it('adds incoming invites for pending email invites', async () => {
    await clientAPIAsInviter.invites.addOutgoing(invite);
    await clientAPIAsInviter.invites.addEmail(invite);

    await clientAPIAsOtherInviter.invites.addOutgoing(otherInvite);
    await clientAPIAsOtherInviter.invites.addEmail(otherInvite);

    await clientAPIAsProfile.profiles.set(profile);

    const result1 = await adminAPI.invites.waitUntilIncomingExists(profile.uid, inviter.uid);
    expect(result1).to.be.true;

    const result2 = await adminAPI.invites.waitUntilEmailDeleted(inviter.uid, profile.email);
    expect(result2).to.be.true;

    const result3 = await adminAPI.invites.waitUntilIncomingExists(profile.uid, otherInviter.uid);
    expect(result3).to.be.true;

    const result4 = await adminAPI.invites.waitUntilEmailDeleted(otherInviter.uid, profile.email);
    expect(result4).to.be.true;
  });

  afterEach(async () => {
    this.timeout(3000);
    await adminAPI.wait(2000);
    await clientAPIAsOtherInviter.destroy();
    await clientAPIAsInviter.destroy();
    await clientAPIAsProfile.destroy();
    await adminAPI.destroy();
  });
});
