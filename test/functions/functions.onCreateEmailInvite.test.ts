import {Invite, Profile, API} from '@bubblesapp/api';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI, createClientAPI} from '../index';
import {expect} from 'chai';

describe('functions.onCreateEmailInvite', () => {
  let clientAPI: API;
  let adminAPI: API;

  before(async () => await beforeAllTests());

  beforeEach(async () => await beforeEachTest());

  describe('when the invited email is a registered user', () => {
    it('creates an incoming invite', async () => {
      // Setup test data:
      // - 2 profiles
      const fromProfile: Profile = {
        uid: chance.guid(),
        email: chance.email(),
        name: chance.name(),
      };

      const toProfile: Profile = {
        uid: chance.guid(),
        email: chance.email(),
        name: chance.name(),
      };

      adminAPI = createAdminAPI();

      await adminAPI.profiles.set(fromProfile);
      await adminAPI.profiles.set(toProfile);

      clientAPI = createClientAPI({
        uid: fromProfile.uid,
        email: fromProfile.email,
      });

      const invite: Invite = {
        from: fromProfile.uid,
        to: toProfile.email,
        createdAt: new Date().getTime(),
        accepted: false,
      };

      await clientAPI.invites.addEmail(invite);

      const result = await adminAPI.invites.waitUntilIncomingExists(toProfile.uid, fromProfile.uid);
      expect(result).to.be.true;
    });
  });

  afterEach(async () => {
    await adminAPI.wait(2000);
    await clientAPI.destroy();
    await adminAPI.destroy();
  });
});
