"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, MoreVertical, Edit, Trash2, Wand2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePrompts } from "@/hooks/use-prompts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UseTemplateDialog } from "./UseTemplateDialog";


interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUseTemplateOpen, setIsUseTemplateOpen] = useState(false);
  const { toast } = useToast();
  const { deletePrompt } = usePrompts();

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
  
  const handleDelete = () => {
    deletePrompt(prompt.id);
    toast({
      title: "Prompt Deleted",
      description: "Your prompt has been successfully removed.",
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
    <Card className="flex h-full flex-col transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="font-headline">{prompt.title}</CardTitle>
                <CardDescription>
                  {prompt.createdAt ? `Created on ${prompt.createdAt.toDate().toLocaleDateString()}` : 'Creating...'}
                </CardDescription>
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/edit/${prompt.id}`} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {prompt.isTemplate && <Badge variant="default">Template</Badge>}
          {prompt.tags.length > 0 ? (
            prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))
          ) : (
            !prompt.isTemplate && <p className="text-sm text-muted-foreground">No tags</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {prompt.isTemplate ? (
            <Button onClick={() => setIsUseTemplateOpen(true)} className="w-full">
                <Wand2 className="mr-2 h-4 w-4" />
                Use Template
            </Button>
        ) : (
            <Button onClick={handleCopy} className="w-full">
              {hasCopied ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {hasCopied ? "Copied!" : "Copy Prompt"}
            </Button>
        )}
      </CardFooter>
    </Card>
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              prompt and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {prompt.isTemplate && (
        <UseTemplateDialog
            isOpen={isUseTemplateOpen}
            onClose={() => setIsUseTemplateOpen(false)}
            prompt={prompt}
        />
      )}
    </>
  );
}
