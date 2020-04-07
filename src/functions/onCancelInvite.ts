import {Invite} from '../models/Invite';
import {adminAPI, firebaseFunctions} from '../index';

export const onCancelInvite = firebaseFunctions.firestore
  .document('users/{uid}/outgoingInvites/{id}')
  .onDelete(async (snap, context) => {
    const {uid} = context.params;
    const invite = snap.data() as Invite;
    try {
      await adminAPI.invites.deleteEmail(uid, invite.to);
    } catch (err) {
      // If the invitee is a user, the email invite will already have been deleted.
      console.log('Ignoring error:', err);
    }
    const toUid = await adminAPI.profiles.uidWihEmail(invite.to);
    if (toUid) {
      await adminAPI.invites.deleteIncoming(toUid, uid).catch(console.error);
    }
  });
