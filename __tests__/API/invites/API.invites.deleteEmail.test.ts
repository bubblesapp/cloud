import {Invite} from '../../../src/models/Invite';
import {beforeAllTests, beforeEachTest, chance, createAdminAPI} from '../../index';
import {API} from '../../../src/API/API';

describe('API.invites.deleteEmail', () => {
  let adminAPI: API;

  beforeAll(async () => {
    await beforeAllTests();
  });

  beforeEach(async () => {
    await beforeEachTest();
    adminAPI = createAdminAPI();
  });

  it('deletes the email invite', async () => {
    const invite: Invite = {
      from: chance.guid(),
      to: chance.email(),
      createdAt: new Date().getTime(),
      accepted: false,
    };
    await adminAPI.invites.addEmail(invite);

    await adminAPI.invites.deleteEmail(invite.from, invite.to);
    await expect(adminAPI.invites.existsEmail(invite.from, invite.to)).resolves.toBeFalsy();
  });

  afterEach(async () => {
    await adminAPI.destroy();
  });
});
