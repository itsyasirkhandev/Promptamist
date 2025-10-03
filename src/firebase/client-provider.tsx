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

export const FirebaseClientProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [instances, setInstances] = useState(() => initializeFirebase())

  return (
    <FirebaseProvider {...instances}>
      <UserProvider>
        <FirebaseErrorListener />
        {children}
      </UserProvider>
    </FirebaseProvider>
  )
}
