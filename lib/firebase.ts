import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // Firebase 콘솔 -> 프로젝트 설정에서 이 부분 전체를 그대로 복사하세요.
  apiKey: "본인의_실제_API_KEY",
  authDomain: "본인의_실제_PROJECT_ID.firebaseapp.com",
  projectId: "본인의_실제_PROJECT_ID",
  storageBucket: "본인의_실제_PROJECT_ID.appspot.com",
  messagingSenderId: "본인의_실제_SENDER_ID",
  appId: "본인의_실제_APP_ID"
};

// 안전한 초기화 로직
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);