
"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, MoreVertical, Edit, Trash2, Wand2, Terminal } from "lucide-react";
import type { Prompt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
  className?: string;
}

export function PromptCard({ prompt, className }: PromptCardProps) {
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
    <Card className={cn(
        "group flex h-full flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1",
        className
    )}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 space-y-1">
             <div className="flex items-center gap-2">
                {prompt.isTemplate && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20">
                        <Wand2 className="h-3.5 w-3.5" />
                    </div>
                )}
                <h3 className="font-headline text-lg font-bold leading-tight tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {prompt.title}
                </h3>
             </div>
            <p className="text-xs text-muted-foreground font-medium">
              {prompt.createdAt ? prompt.createdAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                  <Link href={`/edit/${prompt.id}`} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4 pb-3">
        {/* Content Preview */}
        <div className="relative rounded-md bg-muted/50 p-3 font-mono text-xs text-muted-foreground ring-1 ring-inset ring-border/50 transition-colors group-hover:bg-muted/80 group-hover:text-foreground/80">
            <Terminal className="absolute right-2 top-2 h-3 w-3 text-muted-foreground/50" />
            <p className="line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {prompt.content || <span className="italic opacity-50">No content provided...</span>}
            </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags?.slice(0, 3).map((tag) => (
            <Badge 
                key={tag} 
                variant="secondary" 
                className="rounded-full bg-secondary/50 px-2.5 py-0.5 text-[10px] font-medium hover:bg-secondary transition-colors"
            >
              {tag}
            </Badge>
          ))}
          {prompt.tags?.length > 3 && (
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
              +{prompt.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        {prompt.isTemplate ? (
            <Button onClick={() => setIsUseTemplateOpen(true)} className="w-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md hover:shadow-primary/20 hover:opacity-90 transition-all" size="sm">
                <Wand2 className="mr-2 h-3.5 w-3.5" />
                Use Template
            </Button>
        ) : (
            <Button onClick={handleCopy} variant="outline" className={cn("w-full transition-all", hasCopied && "border-green-500 text-green-600 hover:text-green-700 bg-green-50 dark:bg-green-950/20")} size="sm">
              {hasCopied ? (
                <Check className="mr-2 h-3.5 w-3.5" />
              ) : (
                <Copy className="mr-2 h-3.5 w-3.5" />
              )}
              {hasCopied ? "Copied!" : "Copy Prompt"}
            </Button>
        )}
      </CardFooter>
    </Card>

     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold text-foreground">"{prompt.title}"</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Prompt
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
