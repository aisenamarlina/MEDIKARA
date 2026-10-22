import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const defaultFirebaseConfig = {
  apiKey: "AIzaSyARyuoY21x8zh6bOQqvcIY9LDsUwK3PJLM",
  authDomain: "sibakti-klinik.firebaseapp.com",
  projectId: "sibakti-klinik",
  storageBucket: "sibakti-klinik.firebasestorage.app",
  messagingSenderId: "167753583187",
  appId: "1:167753583187:web:0a3b570233f712354e14a6",
  databaseURL: "https://sibakti-klinik-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || defaultFirebaseConfig.databaseURL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Initialize Auth
export const auth = getAuth(app);
