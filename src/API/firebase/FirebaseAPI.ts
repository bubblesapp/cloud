import {FirebaseProfilesAPI} from './FirebaseProfilesAPI';
import {API} from '../API';
import firebaseTesting from '@firebase/testing';
import {FirebaseFriendsAPI} from './FirebaseFriendsAPI';
import {FirebaseInvitesAPI} from './FirebaseInvitesAPI';
import {Firestore} from './FirestoreTypes';
import {FirebaseBubbleAPI} from './FirebaseBubbleAPI';
import {FirestoreAPI} from './FirestoreAPI';
import admin from 'firebase-admin';
import {FirebaseDevicesAPI} from './FirebaseDevicesAPI';
import {FirebaseNotificationsAPI} from './FirebaseNotificationsAPI';

export class FirebaseAPI extends FirestoreAPI implements API {
  constructor(
    public firestore: Firestore,
    public profiles = new FirebaseProfilesAPI(firestore),
    public friends = new FirebaseFriendsAPI(firestore),
    public invites = new FirebaseInvitesAPI(firestore),
    public bubble = new FirebaseBubbleAPI(firestore),
    public devices = new FirebaseDevicesAPI(firestore),
    public notifications = new FirebaseNotificationsAPI(admin.firestore(), admin.messaging()),
  ) {
    super(firestore);
  }

  wait = async (milliseconds: number): Promise<void> =>
    await new Promise((res) => {
      setTimeout(() => res(), milliseconds);
    });

  destroy = async (): Promise<void> =>
    await (this.firestore as firebaseTesting.firestore.Firestore).app.delete();
}
