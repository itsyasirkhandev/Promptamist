"use client";

import React from "react";
import { useUser } from "@/firebase";
import { PromptsSkeleton } from "./PromptsSkeleton";

export function PromptsPageClientWrapper({ 
    children 
}: { 
    children: React.ReactElement
}) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <PromptsSkeleton />;
  }

  if (!user) {
    return null;
  }

  return <>{React.cloneElement(children, { userId: user.uid } as any)}</>;
}