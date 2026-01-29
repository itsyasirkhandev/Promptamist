"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { initializeFirebase, FirebaseProvider } from "@/firebase/index"
import { UserProvider } from "./auth/use-user"
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener"
import type { UserProfile } from "@/lib/types"

export const FirebaseClientProvider = ({
  children,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialProfile?: UserProfile | null;
}) => {
  const [instances, setInstances] = useState(() => initializeFirebase())

  return (
    <FirebaseProvider {...instances}>
      <UserProvider initialProfile={initialProfile}>
        <FirebaseErrorListener />
        {children}
      </UserProvider>
    </FirebaseProvider>
  )
}
