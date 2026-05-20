import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDn72fWR9UcseyGgK3uefx66f7o9Bv2t9A",
  authDomain: "maplediscord-cfc6a.firebaseapp.com",
  projectId: "maplediscord-cfc6a",
  storageBucket: "maplediscord-cfc6a.firebasestorage.app",
  messagingSenderId: "987351400172",
  appId: "1:987351400172:web:d0106f0270ace182316fc9",
  measurementId: "G-Z1LNXE69EV"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
