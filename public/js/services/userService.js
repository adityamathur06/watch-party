import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "../config/firebase.js";

export function saveUserProfile(uid, name, email) {
  return setDoc(doc(db, "users", uid), {
    name,
    email,
    createdAt: serverTimestamp()
  });
}

export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
