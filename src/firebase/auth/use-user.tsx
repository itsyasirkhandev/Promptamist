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
};

const UserContext = createContext<UserData>({
  user: null,
  claims: null,
  isLoaded: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [claims, setClaims] = useState<IdTokenResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!auth) {
      setIsLoaded(false)
      return
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      if (user) {
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
    () => ({ user, claims, isLoaded }),
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
