"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export function FirebaseErrorListener() {
  const { toast } = useToast()

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
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
