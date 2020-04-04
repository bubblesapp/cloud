import {App} from './index';
import firebaseTesting from '@firebase/testing';

type DocumentReference = firebaseTesting.firestore.DocumentReference;
type DocumentSnapshot = firebaseTesting.firestore.DocumentSnapshot;
type Query = firebaseTesting.firestore.Query;
type QuerySnapshot = firebaseTesting.firestore.QuerySnapshot;

export class TestAPI {
  private static waitUntilDocument = async (
    ref: DocumentReference,
    predicate: (snap: DocumentSnapshot) => boolean = (snap: DocumentSnapshot) => snap.exists,
  ): Promise<DocumentSnapshot> => {
    return await new Promise((res, rej) => {
      const unsubscribe = ref.onSnapshot(
        (snap) => {
          if (predicate(snap)) {
            unsubscribe();
            res(snap);
          }
        },
        (err) => {
          rej(err);
        },
      );
    });
  };

  private static waitUntilQuery = async (
    ref: Query,
    predicate: (snap: QuerySnapshot) => boolean,
  ): Promise<QuerySnapshot> => {
    return await new Promise((res, rej) => {
      const unsubscribe = ref.onSnapshot(
        (snap) => {
          if (predicate(snap)) {
            unsubscribe();
            res(snap);
          }
        },
        (err) => {
          rej(err);
        },
      );
    });
  };

  static waitUntilFriendExists = async (app: App, inUid: string, withUid: string): Promise<boolean> => {
    const ref = app.firestore().collection('users').doc(inUid).collection('friends').doc(withUid);
    const snap = await TestAPI.waitUntilDocument(ref);
    return snap.data().uid === withUid;
  };

  static waitUntilIncomingInviteExists = async (app: App, inUid: string, fromUid: string): Promise<boolean> => {
    const ref = app.firestore().collection('users').doc(inUid).collection('incomingInvites').doc(fromUid);
    const predicate = (ds: DocumentSnapshot) => ds.exists;
    const snap = await TestAPI.waitUntilDocument(ref, predicate);
    return snap.data().from === fromUid;
  };

  static waitUntilOutgoingInviteDeleted = async (app: App, inUid: string, toEmail: string): Promise<boolean> => {
    const ref = app.firestore().collection('users').doc(inUid).collection('outgoingInvites').where('to', '==', toEmail);
    const predicate = (qs: QuerySnapshot) => qs.size === 0;
    const snap = await TestAPI.waitUntilQuery(ref, predicate);
    return snap.size === 0;
  };

  static waitUntilEmailInviteDeleted = async (app: App, toEmail: string): Promise<boolean> => {
    const ref = app.firestore().collection('emailInvites').where('to', '==', toEmail);
    const predicate = (qs: QuerySnapshot) => qs.size === 0;
    const snap = await TestAPI.waitUntilQuery(ref, predicate);
    return snap.size === 0;
  };

  static waitUntilIncomingInviteDeleted = async (app: App, inUid: string, fromUid: string): Promise<boolean> => {
    const ref = app.firestore().collection('users').doc(inUid).collection('incomingInvites').doc(fromUid);
    const predicate = (ds: DocumentSnapshot) => !ds.exists;
    const snap = await TestAPI.waitUntilDocument(ref, predicate);
    return !snap.exists;
  };
}
