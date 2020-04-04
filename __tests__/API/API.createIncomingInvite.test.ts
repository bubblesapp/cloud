import {Invite} from '../../src/models/Invite';
import {API} from '../../src/API/API';
import * as firebaseTesting from '@firebase/testing';
import {App, chance, createTestAdminClientApp, rules} from '../index';
import {projectId} from '../../index';

describe('API.createIncomingInvite', () => {
  let admin: App;
  let invite: Invite;
  let toUid: string;

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

    toUid = chance.guid();

    admin = createTestAdminClientApp();
  });

  it('creates the incoming invite', async () => {
    await API.createIncomingInvite(admin.firestore(), invite, toUid);

    await expect(API.incomingInviteExists(admin.firestore(), invite.from, toUid)).resolves.toBeTruthy();
  });

  afterEach(async () => {
    await admin.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
