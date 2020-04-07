import {Profile} from '../../models/Profile';
import {ProfilesAPI} from '../ProfilesAPI';
import {FirestoreAPI} from './FirestoreAPI';
import {Firestore} from './FirestoreTypes';

export class FirebaseProfilesAPI extends FirestoreAPI implements ProfilesAPI {
  constructor(firestore: Firestore) {
    super(firestore);
  }

  get = async (uid: string): Promise<Profile | undefined> => {
    const doc = await this.profileRef(uid).get();
    return doc.exists ? (doc.data() as Profile) : undefined;
  };

  set = async (profile: Profile): Promise<void> => {
    await this.profileRef(profile.uid).set(profile);
  };

  delete = async (uid: string): Promise<void> => {
    await this.profileRef(uid).delete();
  };

  // TODO: Create index on email in profiles
  uidWihEmail = async (email: string): Promise<string | undefined> => {
    const profiles = await this.profilesRef().where('email', '==', email).get();
    return profiles.docs.pop()?.id;
  };
}
