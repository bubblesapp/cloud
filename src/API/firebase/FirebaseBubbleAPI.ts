import {FirestoreAPI} from './FirestoreAPI';
import {BubbleAPI} from '../BubbleAPI';
import {DocumentSnapshot, Firestore} from './FirestoreTypes';
import {Bubble} from '../../models/Bubble';

export class FirebaseBubbleAPI extends FirestoreAPI implements BubbleAPI {
  constructor(firestore: Firestore) {
    super(firestore);
  }

  get = async (uid: string): Promise<Bubble | undefined> => {
    const snap = await this.bubbleRef(uid).get();
    return snap.exists ? (snap.data() as Bubble) : undefined;
  };

  set = async (bubble: Bubble): Promise<void> => {
    await this.bubbleRef(bubble.uid).set(bubble);
  };

  exists = async (uid: string): Promise<boolean> => {
    const snap = await this.bubbleRef(uid).get();
    return snap.exists;
  };

  delete = async (uid: string): Promise<void> => {
    await this.bubbleRef(uid).delete();
  };

  waitUntilExists = async (uid: string): Promise<boolean> => {
    const snap = await this.waitUntilDocument(this.bubbleRef(uid));
    return snap.exists;
  };

  waitUntilDeleted = async (uid: string): Promise<boolean> => {
    const predicate = (ds: DocumentSnapshot): boolean => !ds.exists;
    const snap = await this.waitUntilDocument(this.bubbleRef(uid), predicate);
    return !snap.exists;
  };

  pop = async (uid: string): Promise<void> => {
    await this.bubbleRef(uid).update({popped: true});
  };

  isPopped = async (uid: string): Promise<boolean> => {
    const bubble = await this.get(uid);
    return bubble.isPopped;
  };
}
