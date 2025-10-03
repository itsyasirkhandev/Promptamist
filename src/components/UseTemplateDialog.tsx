"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePrompts } from "@/hooks/use-prompts";
import type { Prompt, PromptField } from "@/lib/types";

interface UseTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
}

export function UseTemplateDialog({ isOpen, onClose, prompt }: UseTemplateDialogProps) {
  const { toast } = useToast();
  const { addPrompt } = usePrompts();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [finalTitle, setFinalTitle] = useState("");


  const formSchema = useMemo(() => {
    const fieldSchemas = (prompt.fields || []).reduce((acc, field) => {
      let schema;
      switch (field.type) {
        case 'number':
          schema = z.number({ required_error: `${field.name} is required.` });
          break;
        case 'textarea':
        case 'text':
        case 'choices':
        default:
          schema = z.string().min(1, `${field.name} is required.`);
          break;
      }
      return { ...acc, [field.name]: schema };
    }, {});
    return z.object(fieldSchemas);
  }, [prompt.fields]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: (prompt.fields || []).reduce((acc, field) => ({ ...acc, [field.name]: field.type === 'number' ? undefined : '' }), {})
  });
  
  const formValues = form.watch();

  const livePreview = useMemo(() => {
    let content = prompt.content;
    for (const key in formValues) {
      const regex = new RegExp(`{{${key}}}`, "g");
      content = content.replace(regex, formValues[key] || `{{${key}}}`);
    }
    return content;
  }, [prompt.content, formValues]);
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  const handleSave = () => {
     if (!finalTitle) {
      toast({
        variant: "destructive",
        title: "Title Required",
        description: "Please provide a title for the new prompt.",
      });
      return;
    }
    
    addPrompt({
      title: finalTitle,
      content: livePreview,
      tags: tags,
      isTemplate: false,
      fields: [],
    });
    toast({
      title: "Prompt Saved!",
      description: "The new prompt has been added to your library.",
    });
    onClose();
  };
  
  useEffect(() => {
    // Reset state when dialog is closed or prompt changes
    if (!isOpen) {
        form.reset();
        setTags([]);
        setFinalTitle("");
    }
  }, [isOpen, form, prompt]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Use Template: {prompt.title}</DialogTitle>
          <DialogDescription>Fill in the fields to generate a new prompt from this template.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100%-8rem)]">
          <ScrollArea className="h-full">
            <div className="pr-6">
                <h3 className="text-lg font-semibold mb-4">Template Fields</h3>
                <Form {...form}>
                    <form className="space-y-4">
                    {(prompt.fields || []).map((field) => (
                        <FormField
                        key={field.id}
                        control={form.control}
                        name={field.name}
                        render={({ field: formField }) => (
                            <FormItem>
                            <FormLabel>{field.name}</FormLabel>
                            <FormControl>
                                {field.type === 'textarea' ? (
                                    <Textarea {...formField} />
                                ) : field.type === 'choices' && field.options ? (
                                    <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Select ${field.name}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input type={field.type} {...formField} value={formField.value || ''} />
                                )}
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    ))}
                    </form>
                </Form>
            </div>
          </ScrollArea>
          <ScrollArea className="h-full">
             <div className="space-y-4">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <div className="rounded-md border bg-muted p-4 min-h-[200px] whitespace-pre-wrap text-sm">
                    {livePreview}
                </div>
                <Separator />
                 <h3 className="text-lg font-semibold">Save as New Prompt</h3>
                 <div className="space-y-2">
                    <Label htmlFor="new-prompt-title">New Prompt Title</Label>
                    <Input id="new-prompt-title" value={finalTitle} onChange={(e) => setFinalTitle(e.target.value)} placeholder="Enter a title for the generated prompt" />
                 </div>
                 <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input 
                        placeholder="Type a tag and press Enter" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                    />
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
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
            </div>
          </ScrollArea>
        </div>
         <DialogFooter>
            <Button onClick={handleSave} disabled={!form.formState.isValid || !finalTitle}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Save New Prompt
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
