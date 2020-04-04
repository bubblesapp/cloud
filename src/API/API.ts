import admin from 'firebase-admin';
import {Friend} from '../models/Friend';
import {Invite} from '../models/Invite';
import {Profile} from '../models/Profile';
import firebaseTesting from '@firebase/testing';
import {chance} from '../../__tests__';

type Firestore = admin.firestore.Firestore | firebaseTesting.firestore.Firestore;

export class API {
  static createFriend = async (
    firestore: admin.firestore.Firestore,
    uid: string,
    friendUid: string,
    lastMet?: number,
  ): Promise<void> => {
    const friend: Friend = {
      uid: friendUid,
    };
    if (lastMet) {
      friend.lastMet = lastMet;
    }
    await firestore.collection('users').doc(uid).collection('friends').doc(friendUid).set(friend);
  };

  static isFriend = async (firestore: admin.firestore.Firestore, uid: string, of: string): Promise<boolean> => {
    const friend = await firestore.collection('users').doc(of).collection('friends').doc(uid).get();
    return friend.exists;
  };

  static createIncomingInvite = async (firestore: Firestore, invite: Invite, toUid: string): Promise<void> => {
    await firestore.collection('users').doc(toUid).collection('incomingInvites').doc(invite.from).set(invite);
  };

  static createOutgoingInvite = async (firestore: Firestore, invite: Invite): Promise<void> => {
    await firestore.collection('users').doc(invite.from).collection('outgoingInvites').doc().set(invite);
  };

  static createEmailInvite = async (firestore: Firestore, invite: Invite): Promise<string> => {
    const ref = firestore.collection('emailInvites').doc();
    await ref.set(invite);
    return ref.id;
  };

  static emailInviteExists = async (firestore: Firestore, from: string, toEmail: string): Promise<boolean> => {
    const existingInvite = await firestore
      .collection('emailInvites')
      .where('from', '==', from)
      .where('to', '==', toEmail)
      .get();
    return existingInvite.size > 0;
  };

  static incomingInviteExists = async (firestore: Firestore, from: string, to: string): Promise<boolean> => {
    const existingInvite = await firestore.collection('users').doc(to).collection('incomingInvites').doc(from).get();
    return existingInvite.exists;
  };

  static outgoingInviteExists = async (firestore: Firestore, from: string, toEmail: string): Promise<boolean> => {
    const existingInvite = await firestore
      .collection('users')
      .doc(from)
      .collection('outgoingInvites')
      .where('to', '==', toEmail)
      .get();
    return existingInvite.size > 0;
  };

  // TODO: Create index on email in profiles
  static uidWihEmail = async (firestore: admin.firestore.Firestore, email: string): Promise<string | undefined> => {
    const profiles = await firestore.collection('profiles').where('email', '==', email).get();
    if (profiles.size === 0) {
      return;
    }
    return profiles.docs.pop()?.id;
  };

  static deleteEmailInvite = async (firestore: Firestore, fromUid: string, toEmail: string) => {
    const emailInvite = await firestore
      .collection('emailInvites')
      .where('from', '==', fromUid)
      .where('to', '==', toEmail)
      .get();
    if (emailInvite.size === 0) {
      throw `Failed to delete email invite from ${fromUid} to email ${toEmail}. Invite not found.`;
    }
    await emailInvite.docs.pop().ref.delete();
  };

  static deleteIncomingInvite = async (firestore: Firestore, inUid: string, fromUid: string) => {
    await firestore.collection('users').doc(inUid).collection('incomingInvites').doc(fromUid).delete();
  };

  static deleteOutgoingInvite = async (firestore: Firestore, inUid: string, toEmail: string) => {
    const outgoingInvite = await firestore
      .collection('users')
      .doc(inUid)
      .collection('outgoingInvites')
      .where('to', '==', toEmail)
      .get();
    if (outgoingInvite.size === 0) {
      throw `Failed to delete outgoing invite in ${inUid} to email ${toEmail}. Invite not found.`;
    }
    await outgoingInvite.docs.pop().ref.delete();
  };

  static createProfile = async (firestore: Firestore, profile: Profile): Promise<Profile> => {
    await firestore.collection('profiles').doc(profile.uid).set(profile);
    return profile;
  };

  static getProfile = async (firestore: admin.firestore.Firestore, uid: string): Promise<Profile> =>
    await firestore
      .collection('profiles')
      .doc(uid)
      .get()
      .then((doc) => doc.data() as Profile);

  static acceptInvite = async (firestore: Firestore, inUid: string, fromUid: string): Promise<void> => {
    await firestore.collection('users').doc(inUid).collection('incomingInvites').doc(fromUid).update({accepted: true});
  };
}
