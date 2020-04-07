import {adminAPI, firebaseFunctions} from '../index';

// TODO: Replace email lookups by storing ref to outgoing invite in corresponding incoming one
export const onAcceptInvite = firebaseFunctions.firestore
  .document('users/{toUid}/incomingInvites/{fromUid}')
  .onUpdate(async (change, context) => {
    const {toUid, fromUid} = context.params;
    if (change.before.data().accepted === false && change.after.data().accepted === true) {
      // - add invitee to the inviter's bubble
      await adminAPI.friends.set({uid: toUid}, fromUid).catch(console.error);
      // - add inviter to the invitee's bubble
      await adminAPI.friends.set({uid: fromUid}, toUid).catch(console.error);
      // - delete the invites
      const profile = await adminAPI.profiles.get(toUid);
      await adminAPI.invites.deleteOutgoing(fromUid, profile.email);
      // This will delete the corresponding incoming invite
    }
  });
