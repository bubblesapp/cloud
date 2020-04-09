firebase use "${!1}"
firebase deploy --only functions --project "${!1}" --token "$FIREBASE_TOKEN"
