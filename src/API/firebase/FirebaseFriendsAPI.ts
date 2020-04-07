import {FriendsAPI} from '../FriendsAPI';
import {Friend} from '../../models/Friend';
import {FirestoreAPI} from './FirestoreAPI';
import {DocumentSnapshot, Firestore} from './FirestoreTypes';

export class FirebaseFriendsAPI extends FirestoreAPI implements FriendsAPI {
  constructor(firestore: Firestore) {
    super(firestore);
  }

  get = async (friendUid: string, ofUid: string): Promise<Friend | undefined> => {
    const doc = await this.friendRef(friendUid, ofUid).get();
    return doc.exists ? (doc.data() as Friend) : undefined;
  };

  set = async (friend: Friend, ofUid: string): Promise<void> => {
    await this.friendRef(friend.uid, ofUid).set(friend);
  };

  delete = async (friendUid: string, ofUid: string): Promise<void> => {
    await this.friendRef(friendUid, ofUid).delete();
  };

  exists = async (friendUid: string, ofUid: string): Promise<boolean> =>
    !!(await this.get(friendUid, ofUid));

  waitUntilExists = async (friendUid: string, ofUid: string): Promise<boolean> => {
    const snap = await this.waitUntilDocument(this.friendRef(friendUid, ofUid));
    return snap.data().uid === friendUid;
  };

  waitUntilDeleted = async (friendUid: string, ofUid: string): Promise<boolean> => {
    const predicate = (ds: DocumentSnapshot): boolean => !ds.exists;
    const snap = await this.waitUntilDocument(this.friendRef(friendUid, ofUid), predicate);
    return !snap.exists;
  };
}
