import {
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  Query,
  QuerySnapshot,
} from './FirestoreTypes';

export abstract class FirestoreAPI {
  protected constructor(protected firestore: Firestore) {}

  protected waitUntilDocument = async (
    documentReference: DocumentReference,
    predicate: (snap: DocumentSnapshot) => boolean = (snap: DocumentSnapshot): boolean =>
      snap.exists,
  ): Promise<DocumentSnapshot> => {
    return await new Promise((res, rej) => {
      const unsubscribe = documentReference.onSnapshot(
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

  protected waitUntilQuery = async (
    queryReference: Query,
    predicate: (snap: QuerySnapshot) => boolean,
  ): Promise<QuerySnapshot> => {
    return await new Promise((res, rej) => {
      const unsubscribe = queryReference.onSnapshot(
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

  protected usersRef = (): CollectionReference => this.firestore.collection('users');

  protected userRef = (uid: string): DocumentReference => this.usersRef().doc(uid);

  protected friendsRef = (ofUid: string): CollectionReference =>
    this.userRef(ofUid).collection('friends');

  protected friendRef = (friendUid: string, ofUid: string): DocumentReference =>
    this.friendsRef(ofUid).doc(friendUid);

  protected incomingInvitesRef = (toUid: string): CollectionReference =>
    this.userRef(toUid).collection('incomingInvites');

  protected incomingInviteRef = (toUid: string, fromUid: string): DocumentReference =>
    this.incomingInvitesRef(toUid).doc(fromUid);

  protected outgoingInvitesRef = (fromUid: string): CollectionReference =>
    this.userRef(fromUid).collection('outgoingInvites');

  protected outgoingInviteQuery = (fromUid: string, toEmail: string): Query =>
    this.outgoingInvitesRef(fromUid).where('to', '==', toEmail);

  protected emailInvitesRef = (): CollectionReference => this.firestore.collection('emailInvites');

  protected emailInviteQuery = (fromUid: string, toEmail: string): Query =>
    this.emailInvitesRef().where('from', '==', fromUid).where('to', '==', toEmail);

  protected profilesRef = (): CollectionReference => this.firestore.collection('profiles');

  protected profileRef = (uid: string): DocumentReference => this.profilesRef().doc(uid);

  protected bubblesRef = (): CollectionReference => this.firestore.collection('bubbles');

  protected bubbleRef = (uid: string): DocumentReference => this.bubblesRef().doc(uid);

  protected devicesRef = (uid: string): CollectionReference =>
    this.userRef(uid).collection('devices');

  protected deviceRef = (uid: string, id: string): DocumentReference =>
    this.devicesRef(uid).doc(id);
}
