import {FirestoreAPI} from './FirestoreAPI';
import {Firestore} from './FirestoreTypes';
import {Device} from '../../models/Device';
import {DevicesAPI} from '../DevicesAPI';
import admin from 'firebase-admin';
import DocumentSnapshot = admin.firestore.DocumentSnapshot;

export class FirebaseDevicesAPI extends FirestoreAPI implements DevicesAPI {
  constructor(firestore: Firestore) {
    super(firestore);
  }

  get = async (uid: string, id: string): Promise<Device | undefined> => {
    const snap = await this.deviceRef(uid, id).get();
    return snap.exists ? (snap.data() as Device) : undefined;
  };

  list = async (uid: string): Promise<Device[]> => {
    const docs = await (this.devicesRef(
      uid,
    ) as admin.firestore.CollectionReference).listDocuments();
    const snaps = await Promise.all(
      docs.map<Promise<DocumentSnapshot>>((doc) => doc.get()),
    );
    return snaps.map<Device>((snap) => snap.data() as Device);
  };

  delete = async (uid: string, id: string): Promise<void> => {
    await this.deviceRef(uid, id).delete();
  };
}
