
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider, useWatch, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Prompt, PromptField } from '@/lib/types';
import { Copy, Check, Wand2, Save } from 'lucide-react';
import { usePrompts } from '@/hooks/use-prompts';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { PlusCircle, X } from 'lucide-react';
import { Separator } from './ui/separator';


function generateSchemaAndDefaults(fields: PromptField[]) {
    if (!fields || fields.length === 0) {
        return { dynamicSchema: z.object({}), defaultValues: {} };
    }

    const shape: { [key: string]: z.ZodType<any, any> } = {};
    const defaults: { [key: string]: any } = {};

    fields.forEach(field => {
        let schema;
        switch (field.type) {
            case 'number':
                schema = z.preprocess(
                    (a) => {
                        if (typeof a === 'string' && a.trim() === '') return undefined;
                        const parsed = parseFloat(z.string().parse(a));
                        return isNaN(parsed) ? undefined : parsed;
                    },
                    z.number({ required_error: `${field.name} is required.` })
                );
                defaults[field.name] = undefined;
                break;
            case 'choices':
                 if (field.options && field.options.length > 0) {
                    const options = field.options as [string, ...string[]];
                    schema = z.enum(options).describe(`${field.name} is required.`);
                    defaults[field.name] = undefined;
                } else {
                    schema = z.string().min(1, `${field.name} is required.`);
                    defaults[field.name] = '';
                }
                break;
            case 'textarea':
            case 'text':
            default:
                schema = z.string().min(1, `${field.name} is required.`);
                defaults[field.name] = '';
                break;
        }
        shape[field.name] = schema;
    });

    return { dynamicSchema: z.object(shape), defaultValues: defaults };
}

const generatePromptString = (template: string, formValues: Record<string, any>): string => {
    let result = template;
    for (const key in formValues) {
        const value = formValues[key];
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        let replacement = String(value ?? '');

        if (value) { 
            result = result.replace(placeholder, replacement);
        }
    }
    return result;
};


function LivePreview({ control, template }: { control: Control<any>, template: string }) {
    const formValues = useWatch({ control });
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    const generatedPrompt = useMemo(() => {
        return generatePromptString(template, formValues);
    }, [formValues, template]);

    const handleCopyToClipboard = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt);
        setIsCopied(true);
        toast({ title: 'Generated prompt copied!' });
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const renderedPreview = useMemo(() => {
        if (!generatedPrompt) return null;
        return generatedPrompt.split(/({{.*?}})/g).map((part, index) => {
            if (part.match(/{{.*?}}/g)) {
                return (
                    <span key={index} className="bg-destructive/10 text-destructive rounded-sm px-1 py-0.5">
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    }, [generatedPrompt]);

    return (
        <div className="flex flex-col h-full bg-muted/50 rounded-lg border">
            <div className="flex-shrink-0 flex items-center justify-between p-4 pb-2">
                <h3 className="text-sm font-semibold">Live Preview</h3>
                <Button variant="ghost" size="sm" onClick={handleCopyToClipboard} disabled={!generatedPrompt}>
                    {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="text-sm prose prose-sm dark:prose-invert max-w-full whitespace-pre-wrap p-4 pt-0">
                    {renderedPreview}
                </div>
            </ScrollArea>
        </div>
    )
}

type UseTemplateDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
};

export function UseTemplateDialog({ isOpen, onClose, prompt }: UseTemplateDialogProps) {
  const { addPrompt } = usePrompts();
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [finalTitle, setFinalTitle] = useState("");
  const hasFields = useMemo(() => prompt.fields && prompt.fields.length > 0, [prompt.fields]);

  const { dynamicSchema, defaultValues } = useMemo(() => {
    return generateSchemaAndDefaults(prompt.fields || []);
  }, [prompt]);

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
    mode: 'onChange'
  });

  const formValues = form.watch();

  const livePreview = useMemo(() => {
    let content = prompt.content;
    for (const key in formValues) {
      const regex = new RegExp(`{{${key}}}`, "g");
      content = content.replace(regex, (formValues as any)[key] || `{{${key}}}`);
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
    if (isOpen) {
        const { defaultValues: newDefaults } = generateSchemaAndDefaults(prompt.fields || []);
        form.reset(newDefaults);
        setTags(prompt.tags || []);
        setFinalTitle(`Used: ${prompt.title}`);
    }
  }, [isOpen, form, prompt]);

  if (!hasFields) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                     <DialogHeader>
                        <DialogTitle>Use: {prompt.title}</DialogTitle>
                        <DialogDescription>This template has no dynamic fields.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center text-center py-8">
                        <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Fields to Fill</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            This prompt can be copied directly. You can add dynamic fields like {`{{variable}}`} by editing the template.
                        </p>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

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
                <FormProvider {...form}>
                    <form className="space-y-4" key={prompt.id}>
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
                                    <Textarea {...formField} value={formField.value ?? ''} />
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
                                    <Input type={field.type} {...formField} value={formField.value ?? ''} />
                                )}
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    ))}
                    </form>
                </FormProvider>
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
                    <div className="flex flex-wrap gap-2 mt-2">
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
