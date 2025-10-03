"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { PlusCircle, X, Edit, Trash2, Wand2 } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePrompts } from "@/hooks/use-prompts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { Prompt, PromptField } from "@/lib/types";
import { CreateFieldDialog } from "./CreateFieldDialog";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title is too long."),
  content: z.string().min(10, "Prompt content must be at least 10 characters."),
  tags: z.array(z.string().min(1, "Tag cannot be empty.")).max(10, "You can add up to 10 tags.").optional().default([]),
  isTemplate: z.boolean().default(false),
  fields: z.array(z.custom<PromptField>()).default([]),
});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: [],
      isTemplate: false,
      fields: [],
    },
  });

  useEffect(() => {
    if (isEditing && prompt) {
        form.reset({
            title: prompt.title,
            content: prompt.content,
            tags: prompt.tags,
            isTemplate: prompt.isTemplate || false,
            fields: prompt.fields || [],
        });
    }
  }, [isEditing, prompt, form]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag) {
        const currentTags = form.getValues("tags") || [];
        if (!currentTags.includes(newTag)) {
          form.setValue("tags", [...currentTags, newTag]);
          setTagInput("");
        }
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
    } else {
      // Add new field
      form.setValue("fields", [...currentFields, field]);
    }
    setEditingField(null);
  };
  
  const handleEditField = (field: PromptField) => {
    setEditingField(field);
    setIsFieldDialogOpen(true);
  };

  const removeField = (fieldId: string) => {
    const currentFields = form.getValues("fields");
    form.setValue("fields", currentFields.filter(f => f.id !== fieldId));
  };
  
  const isTemplate = form.watch("isTemplate");
  const fields = form.watch("fields");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalValues = {
      ...values,
      fields: values.isTemplate ? values.fields : [],
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

    router.push("/");
  }

  return (
    <>
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="font-headline">Prompt Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Blog Post Idea Generator'" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short, descriptive title for your prompt.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Generate 5 blog post ideas about {{topic}}. The ideas should be engaging and SEO-friendly...'"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main body of your prompt. For templates, use double curly braces like {`{{your_field_name}}`}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
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
                    </div>
                  </FormControl>
                  <FormDescription>
                    Press Enter or comma to add a tag. Helps you categorize your prompts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            
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
                          <div key={field.id} className="flex items-center justify-between rounded-md border p-3">
                            <div>
                              <p className="font-semibold">{field.name}</p>
                              <p className="text-sm text-muted-foreground">Type: {field.type}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditField(field)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Save Prompt'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    <CreateFieldDialog 
        isOpen={isFieldDialogOpen} 
        onClose={() => setIsFieldDialogOpen(false)}
        onAddField={handleAddField}
        existingField={editingField}
    />
    </>
  );
}
