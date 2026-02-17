"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { User, IdTokenResult } from "firebase/auth"
import { useAuth } from "@/firebase/provider"
import type { UserProfile } from "@/lib/types"
import { syncUserProfile } from "@/lib/actions"

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

export const UserProvider = ({ 
  children,
  initialProfile = null 
}: { 
  children: React.ReactNode;
  initialProfile?: UserProfile | null;
}) => {
  const auth = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [claims, setClaims] = useState<IdTokenResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(!!initialProfile)

  const logout = useCallback(async () => {
    if (auth) {
      await Promise.all([
        auth.signOut(),
        fetch('/api/auth/session', { method: 'DELETE' })
      ]);
    }
  }, [auth]);

  useEffect(() => {
    if (!auth) {
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

        // Use Server Action to sync profile (uses Admin SDK, bypassing permission delays)
        if (!profile || profile.uid !== firebaseUser.uid) {
            try {
                const syncedProfile = await syncUserProfile({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                });
                if (syncedProfile) {
                    setProfile(syncedProfile);
                }
            } catch (err) {
                console.error("Error syncing user profile via Server Action:", err);
            }
        }

      } else {
        setClaims(null)
        setProfile(null)
      }
      setIsLoaded(true)
    })

    return () => unsubscribe()
  }, [auth]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ user, profile, claims, isLoaded, logout }),
    [user, profile, claims, isLoaded, logout]
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
