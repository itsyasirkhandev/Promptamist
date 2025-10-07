"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { PlusCircle, X, Edit, Trash2, Wand2, ClipboardPaste } from "lucide-react";
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePrompts } from "@/hooks/use-prompts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Prompt, PromptField } from "@/lib/types";
import { CreateFieldDialog } from "./CreateFieldDialog";
import { ContentEditable } from "./ContentEditable";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title cannot exceed 100 characters."),
  content: z.string().min(10, "Prompt content must be at least 10 characters.").max(10000, "Content cannot exceed 10000 characters."),
  tags: z.array(z.string().min(1, "Tag cannot be empty.").max(30, "Tag cannot exceed 30 characters.")).max(10, "You can add up to 10 tags.").optional().default([]),
  isTemplate: z.boolean().default(false),
  fields: z.array(z.custom<PromptField>()).default([]),
});

const CONTEXT_MENU_ID = "prompt-editor-menu";

type PromptFormProps = {
    prompt?: Prompt;
    isEditing?: boolean;
};

export function CreatePromptForm({ prompt, isEditing = false }: PromptFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addPrompt, updatePrompt } = usePrompts();
  const [tagInput, setTagInput] = useState("");
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<PromptField | null>(null);
  const [selection, setSelection] = useState<Range | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const { show } = useContextMenu({ id: CONTEXT_MENU_ID });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing && prompt ? {
        title: prompt.title,
        content: prompt.content,
        tags: prompt.tags || [],
        isTemplate: prompt.isTemplate || false,
        fields: prompt.fields || [],
    } : {
      title: "",
      content: "",
      tags: [],
      isTemplate: false,
      fields: [],
    },
  });
  
  const isTemplate = form.watch("isTemplate");
  const fields = form.watch("fields");
  const watchedContent = form.watch("content");

  useEffect(() => {
    if (!isTemplate) {
        const currentFields = form.getValues("fields");
        if (currentFields.length > 0) {
            form.setValue('fields', []);
        }
        return;
    };

    const currentFields = form.getValues("fields");
    if (!currentFields) return;

    const placeholdersInContent = watchedContent.match(/{{(.*?)}}/g) || [];
    const fieldNamesInContent = placeholdersInContent.map(p => p.substring(2, p.length - 2).trim());

    const fieldsToKeep = currentFields.filter(field => fieldNamesInContent.includes(field.name));

    if (fieldsToKeep.length !== currentFields.length) {
        form.setValue('fields', fieldsToKeep, { shouldValidate: true, shouldDirty: true });
    }
}, [watchedContent, isTemplate, form]);


  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && newTag.length <= 30) {
        const currentTags = form.getValues("tags") || [];
        if (!currentTags.includes(newTag)) {
          form.setValue("tags", [...currentTags, newTag]);
          setTagInput("");
        }
      } else if (newTag.length > 30) {
        toast({
            variant: 'destructive',
            title: 'Tag is too long',
            description: 'A tag cannot exceed 30 characters.'
        })
      }
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddField = (field: PromptField) => {
    const currentFields = form.getValues("fields");
    const existingFieldIndex = currentFields.findIndex(f => f.id === field.id);
    
    if (existingFieldIndex > -1) {
      // Update existing field
      const updatedFields = [...currentFields];
      updatedFields[existingFieldIndex] = field;
      form.setValue("fields", updatedFields);

      if (editingField && editingField.name !== field.name) {
        const oldPlaceholder = `{{${editingField.name}}}`;
        const newPlaceholder = `{{${field.name}}}`;
        const currentContent = form.getValues('content');
        form.setValue('content', currentContent.replace(new RegExp(oldPlaceholder, 'g'), newPlaceholder));
      }

    } else {
      // Add new field
       if (currentFields.some(f => f.name === field.name)) {
            toast({
                variant: 'destructive',
                title: 'Field already exists',
                description: `A field with the name "${field.name}" already exists in this template.`,
            });
            return;
        }
      form.setValue("fields", [...currentFields, field]);
       // Insert placeholder at selection
        if (selection) {
            const fieldPlaceholder = `{{${field.name}}}`;
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(selection);
                
                selection.deleteContents();
                const textNode = document.createTextNode(fieldPlaceholder);
                selection.insertNode(textNode);
                
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);

                if (editorRef.current) {
                    form.setValue('content', editorRef.current.innerText, { shouldValidate: true, shouldDirty: true });
                }
            }
        }
    }
    
    setEditingField(null);
    setSelection(null);
    setIsFieldDialogOpen(false);
  };
  
  const handleEditFieldClick = (field: PromptField) => {
    setEditingField(field);
    setIsFieldDialogOpen(true);
  };

  const removeField = (fieldToRemove: PromptField) => {
    const currentFields = form.getValues("fields");
    form.setValue("fields", currentFields.filter(f => f.id !== fieldToRemove.id));

    const placeholder = `{{${fieldToRemove.name}}}`;
    const currentContent = form.getValues('content');
    form.setValue('content', currentContent.replace(new RegExp(placeholder, 'g'), ''));
  };
  
  const handleContextMenu = (event: React.MouseEvent) => {
    if (form.getValues('isTemplate')) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editorRef.current?.contains(range.commonAncestorContainer)) {
          event.preventDefault();
          setSelection(range.cloneRange());
          show({ event });
        }
      }
    }
  };

  const handleMakeFieldClick = () => {
    if (selection) {
      const selectedText = selection.toString().trim();
      if (selectedText) {
          setEditingField({ id: '', name: selectedText, type: 'text' });
      } else {
          setEditingField(null);
      }
      setIsFieldDialogOpen(true);
    }
  };

  const handleMobileMakeFieldClick = () => {
    const sel = window.getSelection();
    let selectedText = "";
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        selectedText = range.toString().trim();
        setSelection(range.cloneRange());
      }
    }
    
    if (selectedText) {
      setEditingField({ id: '', name: selectedText, type: 'text' });
    } else {
      setEditingField(null);
    }
    setIsFieldDialogOpen(true);
  };
  
  const handlePaste = async (fieldName: 'title' | 'content') => {
    try {
        const text = await navigator.clipboard.readText();
        form.setValue(fieldName, text, { shouldValidate: true, shouldDirty: true });
        toast({
            title: "Pasted from clipboard!",
        });
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        toast({
            variant: "destructive",
            title: "Failed to paste",
            description: "Could not read content from the clipboard.",
        });
    }
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalValues = {
      ...values,
      fields: values.isTemplate
        ? values.fields.map(f => {
            const field: Partial<PromptField> = { ...f };
            if (!['choices', 'list'].includes(field.type!) || !field.options || field.options.length === 0) {
              delete field.options;
            }
            return field as PromptField;
          })
        : [],
    };
    
    if (isEditing && prompt) {
        updatePrompt(prompt.id, finalValues);
        toast({
            title: "Prompt Updated!",
            description: "Your prompt has been successfully updated.",
        });
    } else {
        addPrompt(finalValues);
        toast({
            title: "Prompt Created!",
            description: "Your new prompt has been saved to your library.",
        });
    }

    router.push("/prompts");
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Core Prompt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Prompt Title</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="e.g., 'Blog Post Idea Generator'" {...field} maxLength={100} className="pr-28" />
                                            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center text-xs text-muted-foreground">
                                                {field.value.length}/100
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                                                onClick={() => handlePaste('title')}
                                            >
                                                <ClipboardPaste className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        A short, descriptive title for your prompt.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="relative">
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-between">
                                            <span>Prompt Content</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePaste('content')}
                                                className="h-auto px-2 py-1 text-xs"
                                            >
                                                <ClipboardPaste className="mr-1 h-3 w-3" />
                                                Paste
                                            </Button>
                                        </FormLabel>
                                        <FormControl>
                                            <div onContextMenu={handleContextMenu} className="relative">
                                                <ContentEditable
                                                    ref={editorRef}
                                                    html={field.value}
                                                    fields={fields}
                                                    isTemplate={isTemplate}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    className="min-h-[300px] pr-16"
                                                />
                                                <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                                                    {field.value.length}/10000
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            {isTemplate && "Right-click or use the floating button to create a field from selected text."}
                                            {!isTemplate && "The main body of your prompt."}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                {isTemplate && (
                                    <div className="absolute bottom-12 right-3">
                                        <Button type="button" size="icon" onClick={handleMobileMakeFieldClick} className="rounded-full shadow-lg h-12 w-12">
                                            <Wand2 className="h-5 w-5" />
                                            <span className="sr-only">Create Field from Selection</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input 
                                                placeholder="Type a tag and press Enter" 
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                maxLength={30}
                                                className="pr-12"
                                            />
                                            <div className="absolute bottom-0 right-3 flex h-full items-center text-xs text-muted-foreground">
                                                {tagInput.length}/30
                                            </div>
                                        </div>
                                    </FormControl>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {field.value?.map(tag => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                            <button
                                            type="button"
                                            className="ml-1.5 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onClick={() => removeTag(tag)}
                                            >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Remove {tag}</span>
                                            </button>
                                        </Badge>
                                        ))}
                                    </div>
                                    <FormDescription>
                                        Press Enter or comma to add a tag. Helps you categorize your prompts.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                    
                    <FormField
                        control={form.control}
                        name="isTemplate"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                Enable Templating
                                </FormLabel>
                                <FormDescription>
                                Turn this prompt into a reusable template with dynamic fields.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    
                    {isTemplate && (
                    <Card>
                        <CardHeader>
                        <CardTitle>Template Fields</CardTitle>
                        <CardDescription>Define the dynamic parts of your prompt.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="space-y-4">
                            {fields.length > 0 ? (
                            <div className="space-y-2">
                                {fields.map((field) => (
                                <div key={field.id} className="rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{field.name}</p>
                                            <p className="text-sm text-muted-foreground">Type: {field.type}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" type="button" onClick={() => handleEditFieldClick(field)}>
                                            <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" type="button" onClick={() => removeField(field)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                        </div>
                                </div>
                                ))}
                            </div>
                            ) : (
                            <p className="text-sm text-muted-foreground text-center">No template fields added yet.</p>
                            )}
                            <Button type="button" variant="outline" onClick={() => { setEditingField(null); setIsFieldDialogOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Field
                            </Button>
                        </div>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isEditing ? 'Save Changes' : 'Save Prompt'}
                </Button>
            </div>
          </form>
        </Form>
      
    {isTemplate && (
        <Menu id={CONTEXT_MENU_ID}>
            <Item onClick={handleMakeFieldClick}>
                Create Field from Selection
            </Item>
        </Menu>
    )}
    <CreateFieldDialog 
        isOpen={isFieldDialogOpen} 
        onClose={() => {
            setIsFieldDialogOpen(false);
            setEditingField(null);
            setSelection(null);
        }}
        onAddField={handleAddField}
        existingField={editingField}
    />
    </>
  );
}
