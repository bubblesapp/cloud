let projectId;
if (process.env.FIREBASE_CONFIG) {
  projectId = JSON.parse(process.env.FIREBASE_CONFIG).projectId;
} else if (process.env.GCLOUD_PROJECT) {
  projectId = JSON.parse(process.env.GCLOUD_PROJECT);
}

export {projectId};

export * from './src/functions/onAcceptInvite';
export * from './src/functions/onCancelInvite';
export * from './src/functions/onCreateEmailInvite';
