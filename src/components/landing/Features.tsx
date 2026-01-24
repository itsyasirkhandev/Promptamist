
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, Wand2, Tags, Copy } from "lucide-react";
import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Library className="h-8 w-8" />,
    title: "Centralized Library",
    description: "A single, searchable home for every prompt you create. No more lost notes or scattered documents."
  },
  {
    icon: <Wand2 className="h-8 w-8" />,
    title: "Dynamic Templating",
    description: "Turn any prompt into a reusable template with dynamic fields like `{{topic}}` or `{{tone}}`."
  },
  {
    icon: <Tags className="h-8 w-8" />,
    title: "Tagging & Filtering",
    description: "Organize your prompts with custom tags and find exactly what you need in seconds with powerful search."
  },
  {
    icon: <Copy className="h-8 w-8" />,
    title: "One-Click Copy",
    description: "Instantly copy any prompt or generated template to your clipboard, ready for use in any AI tool."
  }
];

export function Features() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} id="features" className="py-16 sm:py-24 bg-muted/50 scroll-mt-20">
      <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 opacity-0", isIntersecting && "animate-in fade-in-up")}>
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
            Everything You Need to Master Your Prompts
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            From simple snippets to complex, multi-variable templates, Promptamist has you covered.
          </p>
        </div>

        <div className="mt-12">
            <Image
                src="https://i.postimg.cc/XYQwh2z7/promptamist-use-prompt-dialog.png"
                alt="Use prompt template dialog"
                width={1200}
                height={800}
                className="rounded-lg shadow-xl ring-1 ring-border"
            />
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
                <div key={feature.title} className="flex flex-col items-center text-center [--delay:0s]" style={{animationDelay: `calc(${i * 100}ms + var(--delay, 0s))`}}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {feature.icon}
                    </div>
                    <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
