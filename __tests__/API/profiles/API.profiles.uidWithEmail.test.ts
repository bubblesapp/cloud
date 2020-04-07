import {Profile} from '../../../src/models/Profile';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI} from '../../index';
import {API} from '../../../src/API/API';

describe('API.profiles.uidWithEmail', () => {
  let adminAPI: API;

  beforeAll(async () => await beforeAllTests());

  beforeEach(async () => {
    await beforeEachTest();
    adminAPI = createAdminAPI();
  });

  it('returns the uid of the profile with the given email', async () => {
    const profile: Profile = {
      uid: chance.guid(),
      email: chance.email(),
      name: chance.name(),
    };

    await adminAPI.profiles.set(profile);
    await expect(adminAPI.profiles.uidWihEmail(profile.email)).resolves.toEqual(profile.uid);
  });

  it('returns undefined if no user exists with the given email', async () => {
    const profile: Profile = {
      uid: chance.guid(),
      email: chance.email(),
      name: chance.name(),
    };

    await adminAPI.profiles.set(profile);

    await expect(adminAPI.profiles.uidWihEmail(chance.email())).resolves.toBeUndefined();
  });

  afterEach(async () => {
    await adminAPI.destroy();
  });
});
