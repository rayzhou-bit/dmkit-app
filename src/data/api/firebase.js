import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_APP_DATABASE_URL,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGE_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
};

const REQUIRED_KEYS = ['apiKey', 'authDomain', 'projectId'];

const hasValue = (value) => typeof value === 'string' && value.trim() !== '';

const isFirebaseConfigured = REQUIRED_KEYS.every((key) => hasValue(firebaseConfig[key]));

const FIREBASE_NOT_CONFIGURED_CODE = 'app/firebase-not-configured';
const FIREBASE_NOT_CONFIGURED_MESSAGE =
  "Firebase isn't configured. Set the VITE_APP_* Firebase variables in .env.local to enable sign in and saving.";

if (!isFirebaseConfigured) {
  console.warn(
    [
      'Running in offline mode: only the intro project is available.',
      'Set these VITE_APP_* variables in .env.local to enable Firebase sign in and saving:',
      '  VITE_APP_API_KEY',
      '  VITE_APP_AUTH_DOMAIN',
      '  VITE_APP_DATABASE_URL',
      '  VITE_APP_PROJECT_ID',
      '  VITE_APP_STORAGE_BUCKET',
      '  VITE_APP_MESSAGE_SENDER_ID',
      '  VITE_APP_APP_ID',
    ].join('\n'),
  );
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const db = isFirebaseConfigured ? getFirestore(app) : null;

export {
  app,
  db,
  isFirebaseConfigured,
  FIREBASE_NOT_CONFIGURED_CODE,
  FIREBASE_NOT_CONFIGURED_MESSAGE,
};
