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
import { getUserProfile } from "@/lib/api"
import { revalidateUserProfile, syncUserProfileAction } from "@/lib/actions"

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
  const firestore = useFirestore()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [claims, setClaims] = useState<IdTokenResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(!!initialProfile)

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

        // Only fetch if we don't have a matching initial profile
        if (!profile || profile.uid !== firebaseUser.uid) {
            // Sync/Fetch profile
            try {
                // 1. Try to get from server-side cache first (much faster if cached)
                const cachedProfile = await getUserProfile(firebaseUser.uid);
                if (cachedProfile) {
                    setProfile(cachedProfile);
                } else {
                    // 2. Fallback to server action to sync/fetch
                    const profileData = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    };
                    
                    await syncUserProfileAction(profileData);
                    
                    // After syncing, we can fetch the profile again or just set it
                    const updatedProfile = await getUserProfile(firebaseUser.uid);
                    if (updatedProfile) {
                        setProfile(updatedProfile);
                    }
                }
            } catch (err) {
                console.error("Error fetching/syncing user profile:", err);
            }
        }

      } else {
        setClaims(null)
        setProfile(null)
      }
      setIsLoaded(true)
    })

    return () => unsubscribe()
  }, [auth, firestore]) // eslint-disable-line react-hooks/exhaustive-deps

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
