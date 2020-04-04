import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';
import * as firebaseTesting from '@firebase/testing';
import {App, chance, createTestAdminClientApp, rules} from '../index';
import {projectId} from '../../index';

describe('API.deleteEmailInvite', () => {
  let admin: App;
  let invite: Invite;

  beforeAll(async () => {
    await firebaseTesting.loadFirestoreRules({projectId, rules});
  });

  beforeEach(async () => {
    await firebaseTesting.clearFirestoreData({projectId});

    invite = {
      from: chance.guid(),
      to: chance.email(),
      createdAt: new Date().getTime(),
      accepted: false,
    };

    admin = createTestAdminClientApp();

    await API.createEmailInvite(admin.firestore(), invite);
  });

  it('deletes the email invite', async () => {
    await API.deleteEmailInvite(admin.firestore(), invite.from, invite.to);
    await expect(API.emailInviteExists(admin.firestore(), invite.from, invite.to)).resolves.toBeFalsy();
  });

  afterEach(async () => {
    await admin.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
