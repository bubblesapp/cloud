import {adminAPI, firebaseFunctions} from '../index';
import {Profile} from '../models/Profile';

export const onCreateProfile = firebaseFunctions.firestore
  .document('profiles/{uid}')
  .onCreate(async (snapshot, context) => {
    const {uid} = context.params;
    const profile = snapshot.data() as Profile;
    if (profile) {
      // Create the user's bubble
      const bubble = {
        uid,
        isPopped: false,
      };
      await adminAPI.bubble.set(bubble);

      // Look for pending email invites
      const emailInvites = await adminAPI.invites.listEmail(profile.email);
      await Promise.all(
        emailInvites.map(
          // Add incoming invite and delete email invite
          async (emailInvite): Promise<void> => {
            await adminAPI.invites.setIncoming(profile.uid, emailInvite);
            await adminAPI.invites.deleteEmail(emailInvite.from, profile.email);
          },
        ),
      );
    }
  });
