import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "본인의_API_KEY",
  authDomain: "본인의_PROJECT_ID.firebaseapp.com",
  projectId: "본인의_PROJECT_ID",
  storageBucket: "본인의_PROJECT_ID.appspot.com",
  messagingSenderId: "본인의_SENDER_ID",
  appId: "본인의_APP_ID"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // 이 줄이 반드시 있어야 합니다.