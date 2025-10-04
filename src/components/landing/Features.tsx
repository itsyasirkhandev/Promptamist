import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, Wand2, Tags, Copy } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: <Library className="h-6 w-6" />,
    title: "Centralized Library",
    description: "A single, searchable home for every prompt you create. No more lost notes."
  },
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: "Dynamic Templating",
    description: "Turn any prompt into a reusable template with dynamic fields like `{{topic}}` or `{{tone}}`."
  },
  {
    icon: <Tags className="h-6 w-6" />,
    title: "Tagging & Filtering",
    description: "Organize your prompts with custom tags and find exactly what you need in seconds."
  },
  {
    icon: <Copy className="h-6 w-6" />,
    title: "One-Click Copy",
    description: "Instantly copy any prompt or generated template to your clipboard, ready for use."
  }
];

export function Features() {
  return (
    <section className="py-16 sm:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
            Everything You Need to Master Your Prompts
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            From simple snippets to complex, multi-variable templates, Promptamist has you covered.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="grid gap-6 sm:grid-cols-2">
                {features.map((feature) => (
                    <Card key={feature.title}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                               <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                 {feature.icon}
                               </div>
                               <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                            </div>
                            <CardDescription className="pt-4">{feature.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
            <div className="mt-10 lg:mt-0 order-first lg:order-last">
                 <Image
                    src="https://i.postimg.cc/XYQwh2z7/promptamist-use-prompt-dialog.png"
                    alt="Use prompt template dialog"
                    width={1200}
                    height={800}
                    className="rounded-lg shadow-xl ring-1 ring-border"
                />
            </div>
        </div>
      </div>
    </section>
  );
}
