import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';
import * as firebaseTesting from '@firebase/testing';
import {App, chance, rules} from '../index';
import {projectId} from '../../index';
import {createTestAdminClientApp} from '../index';

describe('API.createOutgoingInvite', () => {
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
  });

  it('creates the outgoing invite', async () => {
    await API.createOutgoingInvite(admin.firestore(), invite);

    await expect(API.outgoingInviteExists(admin.firestore(), invite.from, invite.to)).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await admin.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
