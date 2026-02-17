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
import { useAuth, useFirestore } from "@/firebase/provider"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { userProfileConverter } from "@/firebase/converters"
import type { UserProfile } from "@/lib/types"
import { getUserProfile } from "@/lib/api"
import { revalidateUserProfile } from "@/lib/actions"

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

  const logout = useCallback(async () => {
    if (auth) {
      await Promise.all([
        auth.signOut(),
        fetch('/api/auth/session', { method: 'DELETE' })
      ]);
    }
  }, [auth]);

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
                    // 2. Fallback to direct Firestore fetch if not in cache
                    const profileRef = doc(firestore, "users", firebaseUser.uid).withConverter(userProfileConverter);
                    
                    // Add a small retry loop for 'missing or insufficient permissions' 
                    // which often happens when a user JUST signed in and the token hasn't 
                    // propagated to Firestore rules yet.
                    let profileSnap = null;
                    let retries = 0;
                    while (retries < 3) {
                        try {
                            profileSnap = await getDoc(profileRef);
                            break;
                        } catch (err: any) {
                            if (err.code === 'permission-denied' && retries < 2) {
                                console.warn(`Permission denied on profile fetch, retrying (${retries + 1}/3)...`);
                                await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
                                retries++;
                            } else {
                                throw err;
                            }
                        }
                    }
                    
                    if (profileSnap && !profileSnap.exists()) {
                        // Wait a bit to avoid race condition with EmailSignUpForm which also creates the profile
                        // If it still doesn't exist, we create it (likely Google/OAuth signup)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const secondCheck = await getDoc(profileRef);
                        
                        if (!secondCheck.exists()) {
                            const newProfile: UserProfile = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                firstName: null, // Default for non-email signup (e.g. Google)
                                lastName: null,
                                photoURL: firebaseUser.photoURL,
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp(),
                            };
                            await setDoc(profileRef, newProfile);
                            setProfile(newProfile);
                            await revalidateUserProfile(firebaseUser.uid);
                        } else {
                            const p = secondCheck.data();
                            setProfile(p || null);
                            await revalidateUserProfile(firebaseUser.uid);
                        }
                    } else if (profileSnap) {
                        const p = profileSnap.data();
                        setProfile(p || null);
                        await revalidateUserProfile(firebaseUser.uid);
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
