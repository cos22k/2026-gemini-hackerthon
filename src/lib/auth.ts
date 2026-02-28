import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import app from './firebase';

export const auth = getAuth(app);

export async function ensureAnonymousUser(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;
  const cred = await signInAnonymously(auth);
  return cred.user.uid;
}

export function useAuth(): { uid: string | null; loading: boolean } {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [loading, setLoading] = useState(!auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      setLoading(false);
    });
    // Auto sign-in anonymously if not signed in
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(() => setLoading(false));
    }
    return unsub;
  }, []);

  return { uid, loading };
}
