import admin from "firebase-admin";
import "dotenv/config";

// Initializes the Firebase Admin SDK using environment variables only.
// Supports two setups:
//  1) FIREBASE_SERVICE_ACCOUNT_JSON — full service-account JSON as one line
//  2) FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY — split fields
function buildCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return admin.credential.cert(parsed);
  }

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // .env files store newlines as literal "\n" — convert them back
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  throw new Error(
    "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or the FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY trio in backend/.env"
  );
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: buildCredential() });
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
