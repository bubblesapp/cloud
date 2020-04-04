import {firebaseAdmin, firebaseFunctions} from '../index';
import {API} from '../API/API';

// TODO: Replace email lookups by storing ref to outgoing invite in corresponding incoming one
export const onAcceptInvite = firebaseFunctions.firestore
  .document('users/{uid}/incomingInvites/{from}')
  .onUpdate(async (change, context) => {
    const {uid, from} = context.params;
    if (!change.before.data().accepted && change.after.data().accepted) {
      const alreadyFriends = await API.isFriend(firebaseAdmin.firestore(), uid, from);
      // If users are already friends (this should normally be prevented
      // by the client app)
      if (!alreadyFriends) {
        // - add invitee to the inviter's bubble
        await API.createFriend(firebaseAdmin.firestore(), from, uid).catch(console.error);
        // - add inviter to the invitee's bubble
        await API.createFriend(firebaseAdmin.firestore(), uid, from).catch(console.error);
      }
      // - delete the invites
      const profile = await API.getProfile(firebaseAdmin.firestore(), uid);
      await API.deleteOutgoingInvite(firebaseAdmin.firestore(), from, profile.email);
      // This will delete the corresponding incoming invite
    }
  });
