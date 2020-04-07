import {Invite} from '../../models/Invite';
import {InvitesAPI} from '../InvitesAPI';
import {FirestoreAPI} from './FirestoreAPI';
import {DocumentSnapshot, Firestore, QuerySnapshot} from './FirestoreTypes';

export class FirebaseInvitesAPI extends FirestoreAPI implements InvitesAPI {
  constructor(firestore: Firestore) {
    super(firestore);
  }

  setIncoming = async (toUid: string, invite: Invite): Promise<void> => {
    await this.incomingInviteRef(toUid, invite.from).set(invite);
  };

  deleteIncoming = async (toUid: string, fromUid: string): Promise<void> => {
    await this.incomingInviteRef(toUid, fromUid).delete();
  };

  existsIncoming = async (toUid: string, fromUid: string): Promise<boolean> => {
    const existingInvite = await this.incomingInviteRef(toUid, fromUid).get();
    return existingInvite.exists;
  };

  addEmail = async (invite: Invite): Promise<string> => {
    const ref = await this.emailInvitesRef().add(invite);
    return ref.id;
  };

  existsEmail = async (fromUid: string, toEmail: string): Promise<boolean> => {
    const query = await this.emailInviteQuery(fromUid, toEmail).get();
    return query.size > 0;
  };

  deleteEmail = async (fromUid: string, toEmail: string): Promise<void> => {
    const query = await this.emailInviteQuery(fromUid, toEmail).get();
    if (query.size === 0) {
      throw `Failed to delete email invite from ${fromUid}
            to email ${toEmail}. Invite not found.`;
    }
    await query.docs.pop().ref.delete();
  };

  listEmail = async (toEmail: string): Promise<Invite[]> => {
    const querySnapshot = await this.emailInvitesRef().where('to', '==', toEmail).get();
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    return querySnapshot.docs.map((doc) => doc.data() as Invite);
  };

  addOutgoing = async (invite: Invite): Promise<string> => {
    const ref = await this.outgoingInvitesRef(invite.from).add(invite);
    return ref.id;
  };

  existsOutgoing = async (fromUid: string, toEmail: string): Promise<boolean> => {
    const query = await this.outgoingInvitesRef(fromUid).where('to', '==', toEmail).get();
    return query.size > 0;
  };

  deleteOutgoing = async (fromUid: string, toEmail: string): Promise<void> => {
    const query = await this.outgoingInviteQuery(fromUid, toEmail).get();
    if (query.size === 0) {
      throw `Failed to delete outgoing invite in ${fromUid}
            to email ${toEmail}. Invite not found.`;
    }
    await query.docs.pop().ref.delete();
  };

  accept = async (toUid: string, fromUid: string): Promise<void> => {
    await this.incomingInviteRef(toUid, fromUid).update({accepted: true});
  };

  waitUntilIncomingExists = async (toUid: string, fromUid: string): Promise<boolean> => {
    const snap = await this.waitUntilDocument(this.incomingInviteRef(toUid, fromUid));
    return snap.data().from === fromUid;
  };

  waitUntilOutgoingDeleted = async (fromUid: string, toEmail: string): Promise<boolean> => {
    const predicate = (qs: QuerySnapshot): boolean => qs.size === 0;
    const snap = await this.waitUntilQuery(this.outgoingInviteQuery(fromUid, toEmail), predicate);
    return snap.size === 0;
  };

  waitUntilEmailDeleted = async (fromUid: string, toEmail: string): Promise<boolean> => {
    const predicate = (qs: QuerySnapshot): boolean => qs.size === 0;
    const snap = await this.waitUntilQuery(this.emailInviteQuery(fromUid, toEmail), predicate);
    return snap.size === 0;
  };

  waitUntilIncomingDeleted = async (toUid: string, fromUid: string): Promise<boolean> => {
    const predicate = (ds: DocumentSnapshot): boolean => !ds.exists;
    const snap = await this.waitUntilDocument(this.incomingInviteRef(toUid, fromUid), predicate);
    return !snap.exists;
  };
}
