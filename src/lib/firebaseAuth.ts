"use client";

import {
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut as firebaseSignOut,
    type User,
} from "firebase/auth";
import { firebaseApp } from "@/lib/firebase";

export const auth = getAuth(firebaseApp);

export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut() {
    return firebaseSignOut(auth);
}

export { onAuthStateChanged };
export type { User };
