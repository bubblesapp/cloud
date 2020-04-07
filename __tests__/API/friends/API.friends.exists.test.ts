import {Friend} from '../../../src/models/Friend';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI} from '../../index';
import {API} from '../../../src/API/API';

describe('API.friends.exists', () => {
  let adminAPI: API;

  beforeAll(async () => await beforeAllTests());

  beforeEach(async () => {
    await beforeEachTest();
    adminAPI = createAdminAPI();
  });

  it('returns false if friendUid is not friend of ofUid', async () => {
    await expect(adminAPI.friends.exists(chance.guid(), chance.guid())).resolves.toBeFalsy();
  });

  it('returns true if friendUid is friend of toUid', async () => {
    const friend: Friend = {
      uid: chance.guid(),
      lastMet: new Date().getTime(),
    };

    const ofUid = chance.guid();
    await adminAPI.friends.set(friend, ofUid);

    await expect(adminAPI.friends.exists(friend.uid, ofUid)).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await adminAPI.destroy();
  });
});
