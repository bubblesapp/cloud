import {Profile} from '../../src/models/Profile';
import * as firebaseTesting from '@firebase/testing';
import {Invite} from '../../src/models/Invite';
import {projectId} from '../../index';
import {App, chance, createTestAdminClientApp, createTestClientApp, rules} from '../index';
import {API} from '../../src/API/API';
import {TestAPI} from '../TestAPI';

describe('functions.onCreateEmailInvite', () => {
  let client: App;
  let admin: App;

  beforeAll(async () => {
    await firebaseTesting.loadFirestoreRules({projectId, rules});
  });

  beforeEach(async () => {
    await firebaseTesting.clearFirestoreData({projectId});
  });

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

      admin = createTestAdminClientApp();

      await API.createProfile(admin.firestore(), fromProfile);
      await API.createProfile(admin.firestore(), toProfile);

      client = createTestClientApp({
        uid: fromProfile.uid,
        email: fromProfile.email,
      });

      const invite: Invite = {
        from: fromProfile.uid,
        to: toProfile.email,
        createdAt: new Date().getTime(),
        accepted: false,
      };

      await API.createEmailInvite(client.firestore(), invite);

      await expect(TestAPI.waitUntilIncomingInviteExists(admin, toProfile.uid, fromProfile.uid)).resolves.toBeTruthy();
    });
  });

  afterEach(async () => {
    await client.delete();
    await admin.delete();
  });

  afterAll(async () => {
    await Promise.all(firebaseTesting.apps().map((app) => app.delete()));
  });
});
