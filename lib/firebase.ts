// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Next.js 환경에서 Analytics는 브라우저에서만 실행되도록 설정해야 하므로 일단 제외하거나 필요시 추가합니다.

const firebaseConfig = {
  apiKey: "AIzaSyDn72fWR9UcseyGgK3uefx66f7o9Bv2t9A",
  authDomain: "maplediscord-cfc6a.firebaseapp.com",
  projectId: "maplediscord-cfc6a",
  storageBucket: "maplediscord-cfc6a.firebasestorage.app",
  messagingSenderId: "987351400172",
  appId: "1:987351400172:web:d0106f0270ace182316fc9",
  measurementId: "G-Z1LNXE69EV"
};

// 앱이 이미 초기화되었는지 확인하여 중복 초기화를 방지합니다.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 우리가 채팅방에서 사용할 데이터베이스(db)를 내보냅니다.
export const db = getFirestore(app);