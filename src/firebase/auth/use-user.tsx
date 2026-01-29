"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { User, IdTokenResult } from "firebase/auth"
import { useAuth, useFirestore } from "@/firebase/provider"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { userProfileConverter } from "@/firebase/converters"
import type { UserProfile } from "@/lib/types"

export type UserData = {
  user: User | null;
  profile: UserProfile | null;
  claims: IdTokenResult | null;
  isLoaded: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserData>({
  user: null,
  profile: null,
  claims: null,
  isLoaded: false,
  logout: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()
  const firestore = useFirestore()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [claims, setClaims] = useState<IdTokenResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const logout = async () => {
    if (auth) {
      await Promise.all([
        auth.signOut(),
        fetch('/api/auth/session', { method: 'DELETE' })
      ]);
    }
  };

  useEffect(() => {
    if (!auth || !firestore) {
      setIsLoaded(false)
      return
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // Immediate cookie sync for server-side PPR
        fetch('/api/auth/session', {
            method: 'POST',
            body: JSON.stringify({ uid: firebaseUser.uid }),
            headers: { 'Content-Type': 'application/json' },
        });

        const tokenResult = await firebaseUser.getIdTokenResult()
        setClaims(tokenResult)

        // Sync/Fetch profile
        const profileRef = doc(firestore, "users", firebaseUser.uid).withConverter(userProfileConverter);
        try {
            const profileSnap = await getDoc(profileRef);
            if (!profileSnap.exists()) {
                const newProfile: UserProfile = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                await setDoc(profileRef, newProfile);
                setProfile(newProfile);
            } else {
                setProfile(profileSnap.data());
            }
        } catch (err) {
            console.error("Error fetching/syncing user profile:", err);
        }

      } else {
        setClaims(null)
        setProfile(null)
      }
      setIsLoaded(true)
    })

    return () => unsubscribe()
  }, [auth, firestore])

  const value = useMemo(
    () => ({ user, profile, claims, isLoaded, logout }),
    [user, profile, claims, isLoaded]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserData => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
