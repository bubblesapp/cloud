import {Invite} from '../../../src/models/Invite';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI} from '../../index';
import {API} from '../../../src/API/API';

describe('API.invites.existsIncoming', () => {
  let adminAPI: API;
  let toUid: string;
  let invite: Invite;

  beforeAll(async () => await beforeAllTests());

  beforeEach(async () => {
    await beforeEachTest();
    adminAPI = createAdminAPI();

    invite = {
      from: chance.guid(),
      to: chance.email(),
      createdAt: new Date().getTime(),
      accepted: false,
    };

    toUid = chance.guid();
  });

  it('returns true if an incoming invite exists', async () => {
    await adminAPI.invites.setIncoming(toUid, invite);
    await expect(adminAPI.invites.existsIncoming(toUid, invite.from)).resolves.toBeTruthy();
  });

  it("returns false if an incoming invite doesn't exists", async () => {
    await adminAPI.invites.setIncoming(toUid, invite);
    await expect(adminAPI.invites.existsIncoming(toUid, chance.guid())).resolves.toBeFalsy();
    await expect(adminAPI.invites.existsIncoming(chance.guid(), invite.from)).resolves.toBeFalsy();
  });

  afterEach(async () => {
    await adminAPI.destroy();
  });
});
