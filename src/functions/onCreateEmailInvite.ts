import * as functions from 'firebase-functions';
import {Invite} from '../models/Invite';
import {firebaseAdmin, firebaseFunctions} from '../index';
import {API} from '../API/API';

export const onCreateEmailInvite = firebaseFunctions.firestore
  .document('emailInvites/{id}')
  .onCreate(async (snapshot) => {
    const invite = snapshot.data() as Invite;
    if (invite) {
      const toUid = await API.uidWihEmail(firebaseAdmin.firestore(), invite.to);
      // If a user with the 'to' email exists,
      if (toUid) {
        /* const alreadyFriends = await API.isFriend(
          firebaseAdmin.firestore(),
          toUid,
          invite.from,
        );
        const alreadyInvited = await API.outgoingInviteExists(
          firebaseAdmin.firestore(),
          invite.from,
          toUid,
        );
        // If users are already friends, or an invite was
        // already sent (this should normally be prevented
        // by the client app)
        if (alreadyFriends || alreadyInvited) {
          // Delete newly created invite from inviter
          await firebaseAdmin.firestore()
            .collection('users')
            .doc(invite.from)
            .collection('outgoingInvites')
            .doc(invite.to)
            .delete()
            .catch(console.error);
          return;
        } */
        // Otherwise
        // - add the invite to the invitee's collection
        await API.createIncomingInvite(firebaseAdmin.firestore(), invite, toUid);
        // - delete the emailInvite
        await snapshot.ref.delete();
      }
    }
    // Else ignore invite and wait for a user to sign up with that email.
  });
