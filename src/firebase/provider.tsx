"use client"

import React, { createContext, useContext, useMemo } from "react"
import { FirebaseApp } from "firebase/app"
import { Auth } from "firebase/auth"
import { Firestore } from "firebase/firestore"

export type FirebaseContextValue = {
  app: FirebaseApp | null
  auth: Auth | null
  firestore: Firestore | null
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  firestore: null,
})

export const FirebaseProvider = ({
  children,
  app,
  auth,
  firestore,
}: {
  children: React.ReactNode
} & FirebaseContextValue) => {
  const value = useMemo(
    () => ({ app, auth, firestore }),
    [app, auth, firestore]
  )
  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  )
}

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}

export function useFirebaseApp() {
  const { app } = useFirebase()
  return app
}

export function useAuth() {
  const { auth } = useFirebase()
  return auth
}

export function useFirestore() {
  const { firestore } = useFirebase()
  return firestore
}
