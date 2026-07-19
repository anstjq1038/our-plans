import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); }), []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      const fallback = ["auth/popup-blocked", "auth/popup-closed-by-user",
        "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"];
      if (fallback.includes(e.code)) {
        try { await signInWithRedirect(auth, googleProvider); }
        catch (e2: any) { alert("로그인에 실패했어요: " + e2.message); }
      } else {
        alert("로그인에 실패했어요: " + e.message);
      }
    }
  };

  const logout = () => signOut(auth);

  return { user, ready, login, logout };
}
