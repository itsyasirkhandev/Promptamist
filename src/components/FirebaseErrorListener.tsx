"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export function FirebaseErrorListener() {
  const { toast } = useToast()
  const sessionStartTime = useRef(Date.now())

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Ignore permission errors that happen within the first 10 seconds of the session
      // (likely transient propagation delays during signup/signin)
      const timeSinceStart = Date.now() - sessionStartTime.current;
      if (timeSinceStart < 10000) {
        console.warn("Ignoring transient Firestore Permission Error during session startup:", error.message);
        return;
      }

      console.error("Firestore Permission Error:", error.message, error.context)
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: `You do not have permission to perform this action. (${error.context.operation} on ${error.context.path})`,
      })
    }

    errorEmitter.on("permission-error", handlePermissionError)

    return () => {
      errorEmitter.off("permission-error", handlePermissionError)
    }
  }, [toast])

  return null
}
