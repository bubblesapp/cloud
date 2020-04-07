import {Invite} from '../../../src/models/Invite';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI} from '../../index';
import {API} from '../../../src/API/API';

describe('API.invites.addOutgoing', () => {
  let adminAPI: API;

  beforeAll(async () => await beforeAllTests());

  beforeEach(async () => {
    await beforeEachTest();
    adminAPI = createAdminAPI();
  });

  it('creates the outgoing invite', async () => {
    const invite: Invite = {
      from: chance.guid(),
      to: chance.email(),
      createdAt: new Date().getTime(),
      accepted: false,
    };

    await adminAPI.invites.addOutgoing(invite);
    await expect(adminAPI.invites.existsOutgoing(invite.from, invite.to)).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await adminAPI.destroy();
  });
});
