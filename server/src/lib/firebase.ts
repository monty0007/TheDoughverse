import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (projectId && clientEmail && privateKey) {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
} else {
  // Initialize without admin credentials — config endpoint + Google auth still work
  // Token verification will fail until credentials are added
  console.warn('⚠️  Firebase Admin: missing credentials. Token verification disabled.');
  if (projectId) {
    admin.initializeApp({ projectId });
  }
}

export const firebaseAdmin = admin;
