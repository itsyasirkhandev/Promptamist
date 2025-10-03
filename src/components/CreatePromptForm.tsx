"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title is too long."),
  content: z.string().min(10, "Prompt content must be at least 10 characters."),
  tags: z.string().optional(),
});

export function CreatePromptForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { addPrompt } = usePrompts();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const tagsArray = values.tags
      ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];
    
    addPrompt({
      title: values.title,
      content: values.content,
      tags: tagsArray,
    });

    toast({
      title: "Prompt Created!",
      description: "Your new prompt has been saved to your library.",
    });

    router.push("/");
  }

  return (
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
                      placeholder="e.g., 'Generate 5 blog post ideas about {topic}. The ideas should be engaging and SEO-friendly...'"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main body of your prompt. You can use placeholders like {'{topic}'}.
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
                    <Input placeholder="e.g., 'marketing, writing, seo'" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags to help you categorize your prompts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Save Prompt
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
