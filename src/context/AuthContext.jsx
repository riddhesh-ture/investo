import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Firebase auth is not available, skip auth entirely
        if (!auth) {
            setLoading(false);
            return;
        }

        // Lazy import to avoid errors when auth is null
        import('firebase/auth').then(({ onAuthStateChanged }) => {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                setUser(firebaseUser);
                setLoading(false);
            });
            return () => unsubscribe();
        });
    }, []);

    const signIn = async (email, password) => {
        if (!auth) throw new Error('Firebase not configured. Add env vars to .env.local');
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    const signUp = async (email, password, fullName) => {
        if (!auth) throw new Error('Firebase not configured. Add env vars to .env.local');
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
            await updateProfile(result.user, { displayName: fullName });
        }
        return result.user;
    };

    const signInWithGoogle = async () => {
        if (!auth) throw new Error('Firebase not configured. Add env vars to .env.local');
        const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    };

    const resetPassword = async (email) => {
        if (!auth) throw new Error('Firebase not configured. Add env vars to .env.local');
        const { sendPasswordResetEmail } = await import('firebase/auth');
        await sendPasswordResetEmail(auth, email);
    };

    const signOut = async () => {
        if (!auth) return;
        const { signOut: firebaseSignOut } = await import('firebase/auth');
        await firebaseSignOut(auth);
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
