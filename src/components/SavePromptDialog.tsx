
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, PlusCircle } from "lucide-react";
import { usePrompts } from "@/hooks/use-prompts";
import { useToast } from "@/hooks/use-toast";

const saveSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100),
  tags: z.array(z.string().min(1)).max(10),
});

type SaveFormValues = z.infer<typeof saveSchema>;

interface SavePromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  generatedContent: string;
  originalTitle: string;
  originalTags: string[];
}

export function SavePromptDialog({
  isOpen,
  onClose,
  onSaveSuccess,
  generatedContent,
  originalTitle,
  originalTags,
}: SavePromptDialogProps) {
  const { addPrompt } = usePrompts();
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");

  const form = useForm<SaveFormValues>({
    resolver: zodResolver(saveSchema),
    defaultValues: {
      title: "",
      tags: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: `Used: ${originalTitle}`,
        tags: originalTags || [],
      });
    }
  }, [isOpen, originalTitle, originalTags, form]);
  
  const tags = form.watch("tags");

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        form.setValue("tags", [...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue("tags", tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = (values: SaveFormValues) => {
    addPrompt({
      title: values.title,
      content: generatedContent,
      tags: values.tags,
      isTemplate: false,
      fields: [],
    });
    toast({
      title: "Prompt Saved!",
      description: "The new prompt has been added to your library.",
    });
    onSaveSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save New Prompt</DialogTitle>
          <DialogDescription>
            Enter a title and tags for your newly generated prompt.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Prompt Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter a title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        placeholder="Type a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                            <button
                              type="button"
                              className="ml-1.5 rounded-full outline-none"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="submit">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Save Prompt
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
