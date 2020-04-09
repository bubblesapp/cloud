import {Invite, Profile, API} from '@bubblesapp/api';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {expect} from 'chai';

describe('functions.onAcceptInvite', () => {
  let inviter: Profile;
  let invitee: Profile;
  let clientAPI: API;
  let adminAPI: API;

  before(async () => await beforeAllTests());

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

  it('deletes the outgoing invite from the inviter', async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid);
    const result = await adminAPI.invites.waitUntilOutgoingDeleted(inviter.uid, invitee.email);
    expect(result).to.be.true;
  });

  it('deletes the incoming invite from the invitee', async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid);
    const result = await adminAPI.invites.waitUntilIncomingDeleted(invitee.uid, inviter.uid);
    expect(result).to.be.true;
  });

  it("adds inviter to invitee's bubble", async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid).catch((err) => console.log(err));
    const result = await adminAPI.friends.waitUntilExists(invitee.uid, inviter.uid);
    expect(result).to.be.true;
  });

  it("adds invitee to inviter's bubble", async () => {
    await clientAPI.invites.accept(invitee.uid, inviter.uid);
    const result = await adminAPI.friends.waitUntilExists(inviter.uid, invitee.uid);
    expect(result).to.be.true;
  });

  afterEach(async () => {
    await adminAPI.wait(2000);
    await clientAPI.destroy();
    await adminAPI.destroy();
  });
});
