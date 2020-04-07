import {adminAPI, firebaseFunctions} from '../index';

export const onDeleteFriend = firebaseFunctions.firestore
  .document('users/{ofUid}/friends/{friendUid}')
  .onDelete(async (snap, context) => {
    const {ofUid, friendUid} = context.params;
    try {
      await adminAPI.friends.delete(ofUid, friendUid);
    } catch (err) {
      console.log('Ignoring error:', err);
    }
  });
