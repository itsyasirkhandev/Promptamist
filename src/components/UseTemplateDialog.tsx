
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, Control, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Prompt, PromptField } from '@/lib/types';
import { Copy, Check, Wand2, Save, ClipboardPaste } from 'lucide-react';
import { SavePromptDialog } from './SavePromptDialog';


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
                        const s = z.string().max(100).safeParse(a);
                        if (!s.success || s.data.trim() === '') return undefined;
                        const parsed = parseFloat(s.data);
                        return isNaN(parsed) ? undefined : parsed;
                    },
                    z.number({ required_error: `${field.name} is required.` })
                );
                defaults[field.name] = '';
                break;
            case 'choices':
                 if (field.options && field.options.length > 0) {
                    const options = field.options as [string, ...string[]];
                    schema = z.enum(options, { required_error: `${field.name} is required.` });
                    defaults[field.name] = undefined;
                } else {
                    schema = z.string().min(1, `${field.name} is required.`).max(100);
                    defaults[field.name] = '';
                }
                break;
            case 'textarea':
                schema = z.string().min(1, `${field.name} is required.`).max(3000);
                defaults[field.name] = '';
                break;
            case 'text':
            default:
                schema = z.string().min(1, `${field.name} is required.`).max(100);
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
    return result.replace(/{{.*?}}/g, '');
};

function LivePreview({ control, template }: { control: Control<any>, template: string }) {
    const formValues = useWatch({ control });
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    const finalGeneratedPrompt = useMemo(() => {
        return generatePromptString(template, formValues);
    }, [formValues, template]);

    const handleCopyToClipboard = () => {
        if (!finalGeneratedPrompt) return;
        navigator.clipboard.writeText(finalGeneratedPrompt);
        setIsCopied(true);
        toast({ title: 'Generated prompt copied!' });
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const renderedPreview = useMemo(() => {
        if (!template) return <span className="text-muted-foreground">Fill out the fields to see a preview...</span>;

        const parts = template.split(/({{.*?}})/g).filter(part => part);

        return parts.map((part, index) => {
            const match = part.match(/{{(.*?)}}/);
            if (match) {
                const fieldName = match[1].trim();
                const fieldValue = formValues[fieldName];

                if (fieldValue) {
                    return <span key={index} className="bg-primary/20 text-primary rounded-sm px-1">{String(fieldValue)}</span>;
                }
                return <span key={index} className="bg-muted text-muted-foreground rounded-sm px-1">{part}</span>;
            }
            return <span key={index}>{part}</span>;
        });
    }, [template, formValues]);

    return (
        <div className="flex flex-col h-full bg-muted/50 rounded-lg border">
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
                <h3 className="text-sm font-semibold">Live Preview</h3>
                <Button variant="ghost" size="sm" onClick={handleCopyToClipboard} disabled={!finalGeneratedPrompt}>
                    {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="text-sm prose prose-sm dark:prose-invert max-w-full whitespace-pre-wrap p-4">
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
    const hasFields = useMemo(() => prompt.fields && prompt.fields.length > 0, [prompt.fields]);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [generatedPrompt, setGeneratedPrompt] = useState('');


  const { dynamicSchema, defaultValues } = useMemo(() => {
    return generateSchemaAndDefaults(prompt.fields || []);
  }, [prompt]);

  const form = useForm<z.infer<typeof dynamicSchema>>({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
    mode: 'onChange'
  });
  
  const handlePaste = async (fieldName: string) => {
    try {
        const text = await navigator.clipboard.readText();
        form.setValue(fieldName, text, { shouldValidate: true, shouldDirty: true });
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
  };


  const handleSaveClick = () => {
    const formValues = form.getValues();
    const generated = generatePromptString(prompt.content, formValues);
    setGeneratedPrompt(generated);
    setIsSaveDialogOpen(true);
  };
  
  useEffect(() => {
    if (isOpen) {
        const { defaultValues: newDefaults } = generateSchemaAndDefaults(prompt.fields || []);
        form.reset(newDefaults);
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
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle>Use Template: {prompt.title}</DialogTitle>
          <DialogDescription>Fill in the fields to generate a new prompt from this template.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
                <h3 className="text-lg font-semibold mb-4">Template Fields</h3>
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
                                <div className="relative">
                                {field.type === 'textarea' ? (
                                    <>
                                        <Textarea {...formField} value={formField.value ?? ''} className="pr-20" maxLength={3000}/>
                                        <div className="absolute bottom-2 right-12 text-xs text-muted-foreground">
                                            {(formField.value ?? '').length}/3000
                                        </div>
                                    </>
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
                                    <>
                                        <Input type={field.type} {...formField} value={formField.value ?? ''} className="pr-20" maxLength={100} />
                                        <div className="absolute bottom-0 right-12 flex h-full items-center text-xs text-muted-foreground">
                                            {(formField.value ?? '').length}/100
                                        </div>
                                    </>
                                )}
                                {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                                        onClick={() => handlePaste(field.name)}
                                    >
                                        <ClipboardPaste className="h-4 w-4" />
                                    </Button>
                                )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                ))}
                </form>
            </div>
          </ScrollArea>
          <div className="h-full py-4 pr-6">
             <div className="h-full">
                <LivePreview control={form.control} template={prompt.content} />
            </div>
          </div>
        </div>
         <DialogFooter className="flex-shrink-0 p-6 pt-4 border-t">
            <Button onClick={handleSaveClick} disabled={!form.formState.isValid}>
                <Save className="mr-2 h-4 w-4" />
                Save New Prompt
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <SavePromptDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSaveSuccess={() => {
            setIsSaveDialogOpen(false);
            onClose();
        }}
        generatedContent={generatedPrompt}
        originalTitle={prompt.title}
        originalTags={prompt.tags}
    />
    </>
  );
}

    