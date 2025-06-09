const admin = require('firebase-admin');
const serviceAccount = require('./quizkey.json');

// This file initializes Firebase Admin SDK with the service account credentials.
// It uses the Firebase Admin SDK to connect to the Firebase project using the service account key.
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  }),
});
