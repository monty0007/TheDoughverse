import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface FirebaseAuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;

  /** Call once at app mount to start listening */
  listen: () => () => void;

  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function toProfile(u: User): UserProfile {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

export const useFirebaseAuth = create<FirebaseAuthState>()((set) => ({
  user: null,
  loading: true,
  error: null,

  listen: () => {
    let unsub = () => {};
    getFirebaseAuth()
      .then((auth) => {
        unsub = onAuthStateChanged(auth, (fbUser) => {
          set({ user: fbUser ? toProfile(fbUser) : null, loading: false });
        });
      })
      .catch(() => {
        // Firebase init failed (server down, no config, etc.) — stop loading
        set({ user: null, loading: false });
      });
    return () => unsub();
  },

  loginWithEmail: async (email, password) => {
    set({ error: null, loading: true });
    try {
      const auth = await getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      set({ error: friendlyError(e.code), loading: false });
    }
  },

  registerWithEmail: async (email, password, name) => {
    set({ error: null, loading: true });
    try {
      const auth = await getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      set({ user: toProfile(cred.user) });
    } catch (e: any) {
      set({ error: friendlyError(e.code), loading: false });
    }
  },

  loginWithGoogle: async () => {
    set({ error: null, loading: true });
    try {
      const auth = await getFirebaseAuth();
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        set({ loading: false });
        return;
      }
      set({ error: friendlyError(e.code), loading: false });
    }
  },

  logout: async () => {
    const auth = await getFirebaseAuth();
    await signOut(auth);
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
