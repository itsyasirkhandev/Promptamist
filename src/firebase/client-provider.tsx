"use client"

import React, {
  useState,
  use,
} from "react"

import { initializeFirebase, FirebaseProvider } from "@/firebase/index"
import { UserProvider } from "./auth/use-user"
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener"
import type { UserProfile } from "@/lib/types"

export const FirebaseClientProvider = ({
  children,
  initialProfilePromise,
}: {
  children: React.ReactNode;
  initialProfilePromise?: Promise<UserProfile | null>;
}) => {
  const [instances] = useState(() => initializeFirebase())
  const initialProfile = initialProfilePromise ? use(initialProfilePromise) : null;

  return (
    <FirebaseProvider {...instances}>
      <UserProvider initialProfile={initialProfile}>
        <FirebaseErrorListener />
        {children}
      </UserProvider>
    </FirebaseProvider>
  )
}
