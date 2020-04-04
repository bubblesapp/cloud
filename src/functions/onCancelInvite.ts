import {Invite} from '../models/Invite';
import {firebaseAdmin, firebaseFunctions} from '../index';
import {API} from '../API/API';

export const onCancelInvite = firebaseFunctions.firestore
  .document('users/{uid}/outgoingInvites/{id}')
  .onDelete(async (snap, context) => {
    const {uid} = context.params;
    const invite = snap.data() as Invite;
    try {
      await API.deleteEmailInvite(firebaseAdmin.firestore(), uid, invite.to);
    } catch (err) {
      console.log('Ignoring error:', err);
    }
    const toUid = await API.uidWihEmail(firebaseAdmin.firestore(), invite.to);
    if (toUid) {
      await API.deleteIncomingInvite(firebaseAdmin.firestore(), toUid, uid).catch(console.error);
    }
  });
