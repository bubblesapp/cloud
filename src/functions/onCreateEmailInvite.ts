import {Invite} from '@bubblesapp/api';
import {adminAPI, firebaseFunctions} from '../';

export const onCreateEmailInvite = firebaseFunctions.firestore
  .document('emailInvites/{id}')
  .onCreate(async (snapshot) => {
    const invite = snapshot.data() as Invite;
    if (invite) {
      const toUid = await adminAPI.profiles.uidWihEmail(invite.to);
      // If a user with the 'to' email exists,
      if (toUid) {
        const alreadyFriends = await adminAPI.friends.exists(toUid, invite.from);
        const alreadyInvited = await adminAPI.invites.existsOutgoing(invite.from, toUid);
        // If users are already friends, or an invite was
        // already sent (this should normally be prevented
        // by the client app)
        if (alreadyFriends || alreadyInvited) {
          // Delete newly created invite from inviter
          await adminAPI.invites.deleteOutgoing(invite.from, invite.to).catch(console.error);
          return;
        }
        // Otherwise
        // - add the invite to the invitee's collection and notify if necessary
        await adminAPI.invites.setIncoming(toUid, invite);
        await adminAPI.notifications.newInvite(invite.from, toUid);
        // - delete the emailInvite
        await snapshot.ref.delete();
      }
    }
    // Else ignore invite and wait for a user to sign up with that email.
  });
