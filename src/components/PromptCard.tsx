"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Prompt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setHasCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "The prompt content is ready to be pasted.",
    });
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <Card className="flex h-full flex-col transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">{prompt.title}</CardTitle>
        <CardDescription>
          Created on {new Date(prompt.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {prompt.tags.length > 0 ? (
            prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No tags</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCopy} className="w-full">
          {hasCopied ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {hasCopied ? "Copied!" : "Copy Prompt"}
        </Button>
      </CardFooter>
    </Card>
  );
}
