
"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import type { PromptField, PromptFieldType } from "@/lib/types";

const fieldSchema = z.object({
  name: z.string().min(1, "Field name is required."),
  type: z.enum(["text", "textarea", "number", "choices", "list"]),
  options: z.array(z.object({ value: z.string().min(1, "Option cannot be empty.").max(100, "Option cannot exceed 100 characters.") })).optional(),
});

interface CreateFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (field: PromptField) => void;
  existingField?: PromptField | null;
}

export function CreateFieldDialog({ isOpen, onClose, onAddField, existingField }: CreateFieldDialogProps) {
  const form = useForm<z.infer<typeof fieldSchema>>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      type: "text",
      options: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(existingField ? {
          name: existingField.name,
          type: existingField.type,
          options: existingField.options?.map(o => ({ value: o })) || [],
      } : {
        name: "",
        type: "text",
        options: [],
      });
    }
  }, [isOpen, existingField, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const selectedType = form.watch("type");

  const onSubmit = (values: z.infer<typeof fieldSchema>) => {
    const newField: PromptField = {
      id: existingField?.id || new Date().toISOString(),
      name: values.name,
      type: values.type as PromptFieldType,
      options: ['choices', 'list'].includes(values.type) ? values.options?.map(o => o.value) : undefined,
    };
    onAddField(newField);
    onClose();
  };
  
  const handleClose = () => {
    form.reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingField && existingField.id ? 'Edit Field' : 'Create New Field'}</DialogTitle>
          <DialogDescription>
            {existingField && existingField.id ? "Edit the details of your template field." : "Define a new dynamic part of your template."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Topic" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a field type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="choices">Choices (Single Select)</SelectItem>
                      <SelectItem value="list">List (Multi-select)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(selectedType === "choices" || selectedType === "list") && (
              <div className="space-y-2">
                <FormLabel>Options</FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`options.${index}.value`}
                    render={({ field: optionField }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <div className="relative w-full">
                                        <Input {...optionField} placeholder={`Option ${index + 1}`} maxLength={100} className="pr-20" />
                                        <div className="absolute bottom-0 right-9 flex h-full items-center text-xs text-muted-foreground">
                                            {optionField.value.length}/100
                                        </div>
                                    </div>
                                </FormControl>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                             <FormMessage />
                        </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: "" })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            )}
            <DialogFooter>
              <Button type="submit">{existingField && existingField.id ? 'Save Changes' : 'Add Field'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
