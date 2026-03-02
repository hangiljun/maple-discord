// lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDn72fWR9UcseyGgK3uefx66f7o9Bv2t9A",
  authDomain: "maplediscord-cfc6a.firebaseapp.com",
  projectId: "maplediscord-cfc6a",
  storageBucket: "maplediscord-cfc6a.appspot.com",
  messagingSenderId: "987351400172",
  appId: "1:987351400172:web:d0106f0270ace182316fc9",
  measurementId: "G-Z1LNXE69EV"
}

// 🔥 중복 초기화 방지 (Next.js 필수)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// ✅ Auth export
export const auth = getAuth(app)