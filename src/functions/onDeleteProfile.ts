import {adminAPI, firebaseFunctions} from '../';
import admin from 'firebase-admin';
import {FirebaseAPI} from '@bubblesapp/api';

const deleteAllDocumentsInCollection = async (
  collectionReference: admin.firestore.CollectionReference,
): Promise<void> => {
  const documents = await collectionReference.listDocuments();
  await Promise.all(documents.map((doc) => doc.delete()));
};

export const onDeleteProfile = firebaseFunctions.firestore
  .document('profiles/{uid}')
  .onDelete(async (snap, context) => {
    const {uid} = context.params;
    const userRef = (adminAPI as FirebaseAPI).app.firestore().collection('users').doc(uid);
    const collections = await (userRef as admin.firestore.DocumentReference).listCollections();
    // Delete user data (everything under /users/{uid}/).
    // This will trigger functions:
    // - onDeleteFriend: removes user from his friends bubbles
    // - onCancelInvite: removes incoming invites from invitees, and delete email invites
    await Promise.all(collections.map((collection) => deleteAllDocumentsInCollection(collection)));
    await userRef.delete();
    // Delete user bubble
    await adminAPI.bubble.delete(uid);
  });
