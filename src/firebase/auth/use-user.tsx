"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { User, IdTokenResult } from "firebase/auth"
import { useAuth } from "@/firebase/provider"

export type UserData = {
  user: User | null;
  claims: IdTokenResult | null;
  isLoaded: boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserData>({
  user: null,
  claims: null,
  isLoaded: false,
  logout: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()
  const [user, setUser] = useState<User | null>(null)
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
    if (!auth) {
      setIsLoaded(false)
      return
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
        // Immediate cookie sync for server-side PPR
        fetch('/api/auth/session', {
            method: 'POST',
            body: JSON.stringify({ uid: user.uid }),
            headers: { 'Content-Type': 'application/json' },
        });

        const tokenResult = await user.getIdTokenResult()
        setClaims(tokenResult)
      } else {
        setClaims(null)
      }
      setIsLoaded(true)
    })

    return () => unsubscribe()
  }, [auth])

  const value = useMemo(
    () => ({ user, claims, isLoaded, logout }),
    [user, claims, isLoaded]
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
